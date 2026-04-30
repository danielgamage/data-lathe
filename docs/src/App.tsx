import { useMemo, useState } from "react"
import { CompositeGraph } from "./CompositeGraph.js"
import { FunctionReference } from "./FunctionReference"
import { functions } from "./functions.js"

export type Oversampling = 0.5 | 1 | 2
const OVERSAMPLING_OPTIONS: Oversampling[] = [0.5, 1, 2]

function App() {
  const allTags = useMemo(() => {
    const set = new Set<string>()
    for (const fn of functions) {
      for (const tag of (fn.tags as string[] | undefined) ?? []) set.add(tag)
    }
    return Array.from(set).sort()
  }, [])

  const [activeTags, setActiveTags] = useState<Set<string>>(new Set())
  const [oversampling, setOversampling] = useState<Oversampling>(1)
  const [extendedRange, setExtendedRange] = useState(false)

  const toggleTag = (tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  const filtered = useMemo(() => {
    if (activeTags.size === 0) return functions
    return functions.filter((fn) => {
      const tags: string[] = (fn.tags as string[] | undefined) ?? []
      // OR semantics: include functions that match any active tag
      return tags.some((t) => activeTags.has(t))
    })
  }, [activeTags])

  return (
    <div className="App">
      <div className="wrapper">
        <h1>data-lathe</h1>
        <p>A collection of functions for data processing and visualization.</p>
      </div>
      <div className="wrapper">
        <CompositeGraph fn={functions[0]} oversampling={oversampling} extendedRange={extendedRange} />
      </div>
      <div className="wrapper">
        <header>
          <h1>Function Reference</h1>
          <span className="tag-filter-count">
            {filtered.length} / {functions.length}
          </span>
        </header>
        <div className="tag-filter" role="group" aria-label="Filter by tag">
          <button
            type="button"
            className={`tag ${activeTags.size === 0 ? "active" : ""}`}
            onClick={() => setActiveTags(new Set())}
          >
            all
          </button>
          {allTags.map((tag) => (
            <button
              type="button"
              key={tag}
              className={`tag ${activeTags.has(tag) ? "active" : ""}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        </div>
        <div className="toolbar">
      <div className="wrapper">

          <div
            className="oversampling-control"
            role="group"
            aria-label="Oversampling"
          >
            <span className="oversampling-label">Oversampling</span>
            {OVERSAMPLING_OPTIONS.map((value) => (
              <button
                type="button"
                key={value}
                className={`tag ${oversampling === value ? "active" : ""}`}
                onClick={() => setOversampling(value)}
              >
                {value}×
              </button>
            ))}
            <button
              type="button"
              className={`tag ${extendedRange ? "active" : ""}`}
              onClick={() => setExtendedRange((v) => !v)}
              aria-pressed={extendedRange ? "true" : "false"}
            >
              Extended Range
            </button>
          </div>
        </div>
      </div>
      <div className="grid">
        {filtered.map((fn) => (
          <FunctionReference
            key={fn.name}
            fn={fn}
            oversampling={oversampling}
            extendedRange={extendedRange}
          />
        ))}
      </div>
    </div>
  )
}

export default App
