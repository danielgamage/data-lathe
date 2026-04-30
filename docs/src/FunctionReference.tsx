import * as Plot from "@observablehq/plot"
import { useEffect, useId, useMemo, useRef, useState } from "react"
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

export const FunctionReference = ({ fn, oversampling = 1, extendedRange = false }) => {
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
  const pointCount = Math.min(256, Math.floor(width * oversampling))
  const minimumInput = (bidi ? -1 : 0) - (extendedRange ? 1 : 0)
  const maximumInput = 1 + (extendedRange ? 1 : 0)
  const range = maximumInput - minimumInput
  const midpoint = minimumInput + range / 2
  const renderedSource = useMemo(
    () => [
      { input: bidi ? -1 : 0, output: bidi ? -1 : 0 },
      { input: 1, output: 1 },
    ],
    [bidi]
  )

  // Build sample data once per render-relevant change. Hoists the params
  // array out of the per-sample loop and avoids per-sample array spreads.
  const data = useMemo(() => {
    const paramValues = Object.values(parameters)
    const out = new Array(pointCount)
    const span = maximumInput - minimumInput
    const offset = minimumInput
    const denom = pointCount > 1 ? pointCount - 1 : 1
    for (let i = 0; i < pointCount; i++) {
      const input = (i / denom) * span + offset
      let output: number
      if (multiStep) {
        if (mirrorXY) {
          output = mirrorAcrossOrigin(
            input,
            inflectionThroughPoint,
            multiStepPoint.x,
            multiStepPoint.y,
            fn.fn,
            ...paramValues
          )
        } else if (mirrorY) {
          output = mirrorAcrossY(
            input,
            inflectionThroughPoint,
            multiStepPoint.x,
            multiStepPoint.y,
            fn.fn,
            ...paramValues
          )
        } else {
          output = inflectionThroughPoint(
            input,
            multiStepPoint.x,
            multiStepPoint.y,
            fn.fn,
            ...paramValues
          )
        }
      } else if (mirrorXY) {
        output = mirrorAcrossOrigin(input, fn.fn, ...paramValues)
      } else if (mirrorY) {
        output = mirrorAcrossY(input, fn.fn, ...paramValues)
      } else {
        output = fn.fn(input, ...paramValues)
      }
      out[i] = { input, output }
    }
    return out
  }, [
    pointCount,
    bidi,
    minimumInput,
    maximumInput,
    parameters,
    multiStep,
    multiStepPoint,
    mirrorXY,
    mirrorY,
    fn,
  ])

  useEffect(() => {
    if (data === undefined) return

    const maxWidth = width
    const FADE = 64
    const maskId = `fade-mask-${id.replace(/:/g, "")}`
    const dataLineClass = `data-line-${id.replace(/:/g, "")}`
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
        // clamp: true,
      },
      style: {
        background: "transparent",
        overflow: "visible",
      },
      grid: true,
      marks: [
        Plot.tickY([0], { stroke: "var(--gray-6)" }),
        Plot.tickX([0], { stroke: "var(--gray-6)" }),
        Plot.line(renderedSource, {
          x: "input",
          y: "output",
          stroke: "var(--gray-4)",
        }),
        Plot.frame(),
        Plot.line(data, {
          x: "input",
          y: "output",
          className: dataLineClass,
        }),
      ],
    })

    // Inject a vertical fade mask so the data line fades to 0 opacity
    // over FADE px above and below the chart frame.
    const H = maxWidth
    const svgNS = "http://www.w3.org/2000/svg"
    const defs = document.createElementNS(svgNS, "defs")
    const innerStop = FADE / (H + 2 * FADE)
    defs.innerHTML = `
      <linearGradient id="${maskId}-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="white" stop-opacity="0"/>
        <stop offset="${innerStop}" stop-color="white" stop-opacity="1"/>
        <stop offset="${1 - innerStop}" stop-color="white" stop-opacity="1"/>
        <stop offset="1" stop-color="white" stop-opacity="0"/>
      </linearGradient>
      <mask id="${maskId}" maskUnits="userSpaceOnUse"
            x="0" y="${-FADE}" width="${H}" height="${H + 2 * FADE}">
        <rect x="0" y="${-FADE}" width="${H}" height="${H + 2 * FADE}"
              fill="url(#${maskId}-grad)"/>
      </mask>
    `
    chart.prepend(defs)
    const dataGroup = chart.querySelector(`.${CSS.escape(dataLineClass)}`)
    if (dataGroup) dataGroup.setAttribute("mask", `url(#${maskId})`)

    chartRef.current.replaceChildren(chart)
    const gradient = Plot.plot({
      width: maxWidth,
      height: 16,
      margin: 1,
      x: {
        label: null,
        ticks: bidi ? 4 : 5,
        domain: [minimumInput, maximumInput],
      },
      color: {
        type: "diverging",
        clamp: true,
        range: [
          "hsl(191.03, 100%, 100%)",
          "hsl(370.74, 74.68%, 90.58%)",
          "hsl(365.48, 55.27%, 44.69%)",
          "hsl(227.32, 20.47%, 7.51%)",
          "hsl(205.29, 76.67%, 46.61%)",
          "hsl(191.03, 77.58%, 90.42%)",
          "hsl(191.03, 100%, 100%)",
        ],
        domain: [midpoint - range, midpoint + range],
      },
      marks: [
        Plot.tickX(data, { x: "input", stroke: "output", strokeWidth: 1.2 / oversampling }),
        Plot.frame(),
      ],
    })
    gradientRef.current.replaceChildren(gradient)
    return () => {
      chart.remove()
      gradient.remove()
    }
  }, [data, bidi, maximumInput, minimumInput, width, renderedSource, id])

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
      const newParameters: Record<string, number> = {}
      if (dragTarget.current === "multiStepPoint") {
        if (first) {
          initialParameters.current = multiStepPoint
        }
        const movement = (my / bounds.height) * (bidi ? 2 : 1)
        const initialValue = initialParameters.current["y"]
        const result = initialValue + movement * -1
        newParameters["x"] = clamp(result, 0, 1)
        newParameters["y"] = clamp(result, 0, 1)
        setMultiStepPoint((prev) => ({ ...prev, ...newParameters }))
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
        setParameters((prev) => ({ ...prev, ...newParameters }))
      }
    },
    { pointer: { capture: false }, preventDefault: true }
  )

  return (
    <div className="FunctionReference">
      <div className="tags">
        {fn.tags?.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
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
                  step={param.step ?? 0.01}
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
