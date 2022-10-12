import { CompositeGraph } from "./CompositeGraph"
import { FunctionReference } from "./FunctionReference"
import { functions } from "./functionsData.js"

function App() {
  return (
    <div className="App">
      <div className="wrapper">
        <h1>data-lathe</h1>
        <p>
          A collection of functions for data processing and visualization.
        </p>
      </div>
      <div className="wrapper">
        <CompositeGraph fn={functions[0]}/>
      </div>
      <div className="wrapper">
        <h1>Function Reference</h1>
      </div>
      <div className="grid">
        {functions.map((fn) => (
          <FunctionReference key={fn.name} {...{ fn }} />
        ))}
      </div>
    </div>
  )
}

export default App
