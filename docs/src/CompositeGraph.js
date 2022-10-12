import * as Plot from "@observablehq/plot"
import { useEffect, useId, useRef, useState } from "react"
import useMeasure from "react-use-measure"
import {
  mirrorAcrossY,
  mirrorAcrossOrigin,
  inflectionThroughPoint,
} from "data-lathe"
import { useDrag } from "@use-gesture/react"
import dataLathe, { clamp } from "data-lathe"
import { IconToggle } from "./IconToggle"
import { Range } from "./Range"
import { functions } from "./functions.js"
import produce from "immer"
import { useOnClickOutside } from "usehooks-ts"
import { DraggableList } from "./DraggableList.tsx"
import SVG from "react-inlinesvg"
import Button from "./Button.tsx"

export const CompositeGraph = ({}) => {
  const id = useId()

  const dialogRef = useRef(null)
  const handleClickOutside = () => {
    setOpen(false)
  }
  useOnClickOutside(dialogRef, handleClickOutside)

  const [open, setOpen] = useState(false)
  const [measureRef, bounds] = useMeasure({ debounce: 100 })
  const [bidi, setBidi] = useState(true)
  const [mirrorY, setMirrorY] = useState(false)
  const [mirrorXY, setMirrorXY] = useState(false)
  const [multiStep, setMultiStep] = useState(false)
  const [multiStepPoint, setMultiStepPoint] = useState({ x: 0.5, y: 0.5 })
  const [lockedSteps, setLockedSteps] = useState(true)
  const [fnList, setFnList] = useState([])
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
    fnList.forEach((fnItem) => {
      if (fnItem.active) {
        const parameters = fnItem.params?.map((d) => d.value) ?? []
        output = fnItem.fn(output, ...parameters)
      }
    })
    return {
      input: el.input,
      output,
    }
  })
  let minimumInput = bidi ? -1 : 0
  let maximumInput = 1

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
    fnList,
  ])

  const pushFn = (fnName) => {
    const match = functions.find((f) => f.name === fnName)
    setFnList(
      produce(fnList, (draft) => {
        draft.push({
          ...match,
          id: crypto.randomUUID(),
          active: true,
          params:
            match.params?.map((param) => ({
              ...param,
              value: param.default ?? 0.5,
            })) ?? undefined,
        })
      })
    )
  }
  const setParamValue = (id, name, value) => {
    setFnList(
      produce(fnList, (draft) => {
        draft
          .find((f) => f.id === id)
          .params.find((p) => p.name === name).value = value
      })
    )
  }
  const deleteFn = (id) => {
    setFnList(fnList.filter((f) => f.id !== id))
  }
  const toggleActiveFn = (id) => {
    console.log("toggleActiveFn", id)
    setFnList(
      produce(fnList, (draft) => {
        let el = draft.find((f) => f.id === id)
        el.active = !el.active
      })
    )
  }
  console.log(fnList)

  return (
    <div className="CompositeGraph">
      <div className="CompositeGraph__wrapper">
        <figure ref={measureRef}>
          <div className="container">
            <div className="chart" ref={chartRef} />
          </div>
          <div className="gradient" ref={gradientRef} />
        </figure>
        <div>
          <div className="toggles">
            <IconToggle
              checked={bidi}
              onChange={() => setBidi(!bidi)}
              label="Bidirectional"
              highlighted={false}
              icon="bidi"
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
            <div
              className="add-function"
              onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            >
              <button
                onClick={() => {
                  setOpen(!open)
                }}
              >
                <SVG src={`/icons/function.svg`} /> Add Function
              </button>
              <dialog open={open} className="functions-menu" ref={dialogRef}>
                <header>
                  <h3>Functions</h3>
                </header>
                <div className="list">
                  {functions.map((fnItem) => (
                    <button
                      key={fnItem.name}
                      onClick={() => {
                        pushFn(fnItem.name)
                      }}
                    >
                      {fnItem.name}
                    </button>
                  ))}
                </div>
              </dialog>
            </div>
          </div>
          <div className="fields well nested">
            <DraggableList
              items={fnList}
              onReorder={(newList) => {
                setFnList(newList)
              }}
              itemRenderer={(fnItem, bindHandle, index) => (
                <div className="function-card">
                  <header className="function-options">
                    <div className="handle" {...bindHandle(index)}>
                      <SVG src={`/icons/handle.svg`} />
                    </div>
                    <IconToggle
                      checked={fnItem.active}
                      onChange={() => {
                        toggleActiveFn(fnItem.id)
                      }}
                      size="small"
                      label="Toggle"
                      icon="power"
                    />
                    <h3>{fnItem.name}</h3>
                    <Button
                      className="DeleteButton"
                      onClick={() => deleteFn(fnItem.id)}
                      label={<SVG src="/icons/trash.svg" />}
                      confirmLabel={<SVG src="/icons/caution.svg" />}
                    />
                  </header>
                  <div className="function-fields">
                    {fnItem.params?.map((param) =>
                      param.type === "radio" ? (
                        <fieldset className="radio">
                          {param.options.map((option) => (
                            <label key={option}>
                              {option}
                              <input
                                type="radio"
                                value={option}
                                name={`${id}-${param.name}`}
                                checked={param.value === option}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setParamValue(fnItem.id, param.name, option)
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
                            setParamValue(fnItem.id, param.name, v)
                          }}
                          value={param.value}
                        />
                      )
                    )}
                  </div>
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
