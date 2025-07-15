import * as Plot from "@observablehq/plot"
import { useEffect, useId, useRef, useState } from "react"
import useMeasure from "react-use-measure"
import {
  mirrorAcrossY,
  mirrorAcrossOrigin,
  inflectionThroughPoint,
  clamp
} from "data-lathe"
import { useDrag } from "@use-gesture/react"
import { IconToggle } from "./IconToggle"
import { Range } from "./Range"

export const FunctionReference = ({ fn }) => {
  const id = useId()
  const [measureRef, bounds] = useMeasure({ debounce: 100 })
  const [bidi, setBidi] = useState(true)
  const [mirrorY, setMirrorY] = useState(fn.features?.mirrorY ?? false)
  const [mirrorXY, setMirrorXY] = useState(fn.features?.mirrorXY ?? false)
  const [multiStep, setMultiStep] = useState(false)
  const [multiStepPoint, setMultiStepPoint] = useState({ x: 0.5, y: 0.5 })
  const [lockedSteps, setLockedSteps] = useState(true)
  const [parameters, setParameters] = useState(
    (fn.params || []).reduce((acc, param) => {
      acc[param.name] = param.default
      return acc
    }, {})
  )
  const initialParameters = useRef(parameters)
  const width = bounds.width || 100
  const chartRef = useRef(null)
  const gradientRef = useRef(null)
  const oversampling = 2
  const pointCount = Math.floor(width * oversampling)
  const source = Array(pointCount)
    .fill(0)
    .map((_, i) => {
      let input = i / (pointCount - 1)
      if (bidi) {
        input = input * 2 - 1
      }
      return {
        input: input,
        output: input,
      }
    })
  let data = source.map((el) => {
    let output = el.input
    let restParams = [fn.fn, ...Object.values(parameters)]
    if (multiStep) {
      restParams = [
        inflectionThroughPoint,
        multiStepPoint.x,
        multiStepPoint.y,
        ...restParams,
      ]
    }
    if (mirrorXY) {
      output = mirrorAcrossOrigin(output, ...restParams)
    } else if (mirrorY) {
      output = mirrorAcrossY(output, ...restParams)
    } else {
      const callee = restParams.shift(output) // remove fn
      output = callee(output, ...restParams)
    }
    return {
      input: el.input,
      output,
    }
  })
  let minimumInput = bidi ? -1 : 0
  let maximumInput = 1

  console.log({data, fn: fn.name})
  useEffect(() => {
    if (data === undefined) return

    const maxWidth = width
    const chart = Plot.plot({
      width: maxWidth,
      height: maxWidth,
      margin: 0,
      x: {
        ticks: bidi ? 4 : 5,
        domain: [minimumInput, maximumInput],
        tickFormat: () => "",
      },
      y: {
        ticks: bidi ? 4 : 5,
        domain: [minimumInput, maximumInput],
        clamp: true,
      },
      style: {
        background: "transparent",
      },
      grid: true,
      color: {
        type: "diverging",
        scheme: "RdBu",
        domain: [minimumInput, 1],
      },
      marks: [
        Plot.tickY([0], { stroke: "var(--gray-6)" }),
        Plot.tickX([0], { stroke: "var(--gray-6)" }),
        Plot.line(source, {
          x: "input",
          y: "output",
          stroke: "var(--gray-4)",
        }),
        Plot.frame(),
        Plot.line(data, {
          x: "input",
          y: "output",
        }),
      ],
    })
    chartRef.current.append(chart)
    const gradient = Plot.plot({
      width: maxWidth,
      height: 16,
      margin: 1,
      x: {
        scale: "linear",
        ticks: bidi ? 4 : 5,
        domain: [minimumInput, maximumInput],
      },
      color: {
        type: "diverging",
        clamp: true,
        range: [
          "hsl(370.74, 74.68%, 90.58%)",
          "hsl(365.48, 55.27%, 44.69%)",
          "hsl(227.32, 20.47%, 7.51%)",
          "hsl(205.29, 76.67%, 46.61%)",
          "hsl(191.03, 77.58%, 90.42%)",
        ],
        domain: [minimumInput, maximumInput],
      },
      marks: [
        Plot.tickX(data, { x: "input", stroke: "output", strokeWidth: 1.5 }),
        Plot.frame(),
      ],
    })
    gradientRef.current.append(gradient)
    return () => {
      chart.remove()
      gradient.remove()
    }
  }, [
    data,
    bidi,
    maximumInput,
    minimumInput,
    source,
    width,
    multiStepPoint,
    multiStep,
  ])

  const dragTarget = useRef(null)
  const bindDrag = useDrag(
    ({ down, first, movement: [mx, my], cancel, event }) => {
      if (first) {
        if (!event.target.matches(".dot")) {
          cancel()
          return
        } else {
          if (event.target.matches(".multiStepPoint")) {
            dragTarget.current = "multiStepPoint"
          } else {
            dragTarget.current = "fnPoint"
          }
        }
      }
      let newParameters = {}
      if (dragTarget.current === "multiStepPoint") {
        if (first) {
          initialParameters.current = multiStepPoint
        }
        const movement = (my / bounds.height) * (bidi ? 2 : 1)
        const initialValue = initialParameters.current["y"]
        const result = initialValue + movement * -1
        newParameters["x"] = clamp(result, 0, 1)
        newParameters["y"] = clamp(result, 0, 1)
        setMultiStepPoint({ ...multiStepPoint, ...newParameters })
      } else {
        if (first) {
          initialParameters.current = parameters
        }
        ;["x", "y"].forEach((axis) => {
          const isY = axis === "y"
          if (fn[axis]) {
            const name = fn[axis]
            const offset = isY ? my : mx
            const param = fn.params.find((p) => p.name === name)

            const movement =
              (offset /
                (param.max - param.min) /
                (isY ? bounds.height : bounds.width)) *
              (bidi ? 2 : 1)
            const initialValue = initialParameters.current[name]
            const result = initialValue + movement * (isY ? -1 : 1)
            newParameters[name] = clamp(result, param.min, param.max)
          }
        })
        setParameters({ ...parameters, ...newParameters })
      }
    },
    { pointer: { capture: false }, preventDefault: true }
  )

  return (
    <div className="FunctionReference">
      <h2>
        <code>{fn.name}</code>
      </h2>
      <figure ref={measureRef}>
        <div className="container">
          <div className="chart" ref={chartRef} />
          {(fn.x || fn.y) && (
            <div
              className="dot fnPoint"
              {...bindDrag()}
              style={{
                left:
                  (fn.x ? parameters[fn.x] : 0.5) * (bidi ? 50 : 100) +
                  (bidi ? 50 : 0) +
                  "%",
                top:
                  (1 - (fn.y ? parameters[fn.y] : 0.5)) * (bidi ? 50 : 100) +
                  "%",
              }}
            />
          )}
          {multiStep && (
            <div
              className="dot multiStepPoint"
              {...bindDrag()}
              style={{
                left:
                  multiStepPoint.x * (bidi ? 50 : 100) + (bidi ? 50 : 0) + "%",
                top: (1 - multiStepPoint.y) * (bidi ? 50 : 100) + "%",
              }}
            />
          )}
        </div>
        <div className="gradient" ref={gradientRef} />
      </figure>
      <div className="toggles">
        <IconToggle
          checked={bidi}
          onChange={() => setBidi(!bidi)}
          label="Bidirectional"
          highlighted={false}
          icon="bidi"
        />
        <IconToggle
          checked={mirrorXY}
          onChange={() => {
            setMirrorXY(!mirrorXY)
            if (!mirrorXY) {
              setMirrorY(false)
            }
          }}
          label="Mirror X+Y"
          icon="reflectXY"
        />
        <IconToggle
          checked={mirrorY}
          onChange={() => {
            setMirrorY(!mirrorY)
            if (!mirrorY) {
              setMirrorXY(false)
            }
          }}
          label="Mirror Y"
          icon="reflectY"
        />
        <IconToggle
          checked={multiStep}
          onChange={() => {
            setMultiStep(!multiStep)
          }}
          label="Multi step"
          icon="multiStep"
        />
        {multiStep && (
          <div className="well">
            <h3>Inflection coords</h3>
            <div className="multistepOptions">
              <div className="multistepInputs">
                {["x", "y"].filter(Boolean).map((axis) => (
                  <Range
                    label={axis}
                    onChange={(v) => {
                      if (lockedSteps) {
                        setMultiStepPoint({
                          x: v,
                          y: v,
                        })
                      } else {
                        setMultiStepPoint({
                          ...multiStepPoint,
                          [axis]: v,
                        })
                      }
                    }}
                    defaultValue={0.5}
                    value={multiStepPoint[axis]}
                    ticks={[0.25, 0.33, 0.5, 0.67, 0.75]}
                  />
                ))}
              </div>
              <IconToggle
                checked={lockedSteps}
                onChange={() => {
                  setLockedSteps(!lockedSteps)
                }}
                size="small"
                label="Lock"
                icon="lock"
              />
            </div>
          </div>
        )}
      </div>
      <div className="fields well">
        {fn.params && (
          <>
            <h3>Options</h3>
            {fn.params.map((param) =>
              param.type === "radio" ? (
                <fieldset className="radio">
                  {param.options.map((option) => (
                    <label key={option}>
                      {option}
                      <input
                        type="radio"
                        value={option}
                        name={`${id}-${param.name}`}
                        checked={parameters[param.name] === option}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setParameters({
                              ...parameters,
                              [param.name]: option,
                            })
                          }
                        }}
                      />
                    </label>
                  ))}
                </fieldset>
              ) : (
                <Range
                  label={param.name}
                  min={param.min}
                  max={param.max}
                  defaultValue={param.default}
                  ticks={param.ticks}
                  onChange={(v) => {
                    setParameters({
                      ...parameters,
                      [param.name]: v,
                    })
                  }}
                  value={parameters[param.name]}
                />
              )
            )}
          </>
        )}
      </div>
    </div>
  )
}
