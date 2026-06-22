# Contributing to data-lathe

Thanks for helping expand the library. Most contributions add a **pure shaping function** in `src/index.ts` and wire it through the build, type declarations, tests, and the interactive docs site.

## Checklist for a new function

Use this as a PR checklist:

- [ ] Implement the function in [`src/index.ts`](src/index.ts) with a JSDoc comment (description, parameter meaning, and `@see` links where applicable).
- [ ] Run `npm run build` so [`index.js`](index.js) and [`index.d.ts`](index.d.ts) are regenerated from TypeScript (do not hand-edit these files).
- [ ] Register the function in [`site/functions.js`](site/functions.js) (name, `fn`, `params`, `tags`, and optional `features` / `x` / `y`).
- [ ] Add or extend tests in [`src/index.spec.js`](src/index.spec.js) when behavior is non-obvious or easy to regress.
- [ ] Verify the function in the docs dev server (`npm run dev` from the repo root).

## Implementation (`src/index.ts`)

### Conventions

- **Pure functions** — no I/O, globals, or hidden state. Match the style of neighboring exports.
- **First argument** — usually `input` (normalized sample or control value). Additional arguments are tuning parameters with sensible defaults where appropriate.
- **Unipolar vs bipolar** — many functions are documented for `[0, 1]`; bipolar variants often compose with `uniToBi` / `biToUni` or the meta-shapers (`mirrorAcrossY`, `mirrorAcrossOrigin`, `reflectX`, `inflectionThroughPoint`). Say in the JSDoc which domain you expect.
- **Numerical safety** — use the module `epsilon` (`Number.EPSILON`) when dividing by values that can be zero, and clamp control parameters when the algorithm requires it (see `doubleCubicSeat`, `quadraticBezier`, etc.).
- **Section placement** — add the export in the appropriate block (Utilities, Paths, Curves, DSP, Windows, etc.) and keep related functions grouped.

### JSDoc

Public APIs should have a short summary. Link to papers or reference implementations when the formula is not obvious:

```ts
/**
 * Brief description of what the curve does and its domain/range.
 * @see https://example.com/reference
 */
export const myCurve = (input: number, bias: number = 0.5) => { ... }
```

Vite library mode emits `index.js`; `tsc --emitDeclarationOnly` emits `index.d.ts` from JSDoc via [`tsconfig.json`](tsconfig.json).

## Build and published artifacts

From the repository root:

```bash
npm run build      # compiles src/index.ts → index.js + index.d.ts via Vite (for tests and npm publish)
npm run build:compare  # after changing the build, compare against .build-baseline/ for functional equivalence
npm run test:ci    # run tests once
npm run dev        # interactive docs site (imports src/index.ts directly)
npm run build:site # production build of the docs site → dist/
```

**Do not edit `index.js` or `index.d.ts` by hand** — they are build outputs and are what consumers import (`package.json` points `"main"` and `"types"` at them).

## Documentation site (`site/functions.js`)

Each entry in the `functions` array drives one card on the [function reference](https://lathe-rust.vercel.app/) UI.

### Required fields

| Field | Description |
|--------|-------------|
| `name` | Display name; should match the exported symbol (e.g. `"smoothStep"`). |
| `fn` | Reference to the built export, e.g. `lathe.smoothStep`. |
| `tags` | String array for filtering (see [Tags](#tags) below). |

### Parameters (`params`)

Every tunable argument **after** `input` needs a param object so the site can render sliders:

```js
{
  name: "myFunction",
  fn: lathe.myFunction,
  params: [
    { name: "gain", default: 1, min: 0.1, max: 10 },
    { name: "bias", default: 0.5, min: 0, max: 1 },
  ],
  tags: ["curve"],
}
```

**Order matters** — `FunctionReference` passes `Object.values(parameters)` into `fn(input, ...paramValues)`. Param objects are keyed by `name`; initial values come from `default`. Keep the array order aligned with the TypeScript parameter list.

#### Param object shape

| Property | Purpose |
|----------|---------|
| `name` | Label in the UI; must match how you think about the TS argument. |
| `default` | Initial slider value. |
| `min`, `max` | Slider range. Use `[-1, 1]` when the docs chart is used in bipolar mode. |
| `step` | Optional slider step (defaults to `0.01` in the UI). |
| `ticks` | Optional snap positions (e.g. integer orders, quantized steps). |
| `type: "radio"` | Use with `options: ["a", "b", ...]` for discrete choices (see `quantize`). |

### Optional: draggable control point (`x`, `y`)

For functions with handle coordinates in the unit square, set `x` and/or `y` to the **param `name`** that should move when the user drags the dot on the chart:

```js
{
  name: "quadraticBezier",
  fn: lathe.quadraticBezier,
  params: [
    { name: "x", default: 0.5, min: 0, max: 1 },
    { name: "y", default: 0.5, min: 0, max: 1 },
  ],
  x: "x",
  y: "y",
  tags: ["curve"],
}
```

### Optional: `features`

| Feature | Effect |
|---------|--------|
| `mirrorXY: true` | Mirror X+Y toggle starts **on** (symmetric / sigmoid-style preview via `mirrorAcrossOrigin`). |
| `mirrorY: true` | Mirror Y toggle starts **on** (via `mirrorAcrossY`). |
| `bidi: true` | Convention for functions that are most meaningful on **bipolar** `[-1, 1]` inputs (saturation, waveshaping, utilities). The chart still defaults to bipolar; this documents intent and groups related entries. |

`features.mirrorX` appears in one entry but is not wired in `FunctionReference.tsx`; prefer `mirrorXY` for new curves unless that is fixed.

The reference UI also supports **Multi step** (`inflectionThroughPoint`) for any function; no extra registry fields are required.

### Tags

Tags power the filter bar in [`site/App.tsx`](site/App.tsx). Reuse existing tags when they fit; introduce a new tag only when it helps discovery.

Common tags in use:

| Tag | Typical use |
|-----|-------------|
| `utility` | Range mapping, clamping, quantization |
| `curve` | General [0, 1] shaping / easing curves |
| `step` | Smooth or hard steps between edges |
| `sigmoid` | S-curves / saturating response |
| `saturation` | Soft clipping / limiting |
| `waveshaping` | Nonlinear distortion (often with `dsp`) |
| `dsp` | Audio-style processing |
| `easing` | Penner-style or animation eases |
| `bias` | Bias / gain / contrast-style controls |
| `window` | Windows and bumps over a domain |
| `periodic` | Phasors and repeating waveforms |
| `vector` | Multi-handle / polyline-style controls |
| `3d` | Surfaces or subdivision-style curves (e.g. Catmull–Clark) |

A function may have **multiple** tags (e.g. `["curve", "sigmoid"]`).

### Grouping and comments

`functions.js` uses section comments (`// ---------- DSP / saturation ----------`). Place new entries in the most relevant section to keep the file scannable.

## Tests (`src/index.spec.js`)

Tests import the built [`index.js`](index.js) package (`import * as lathe from '../index'`).

Add tests when you can assert something meaningful:

- Fixed points (e.g. passes through `(0, 0)` and `(1, 1)`).
- Monotonicity or range (`output` in `[0, 1]`).
- Known values at `input = 0.5` or at parameter defaults.
- Edge cases (clamping below/above edges for step functions).

Not every function needs exhaustive coverage; one focused test is better than none for tricky math.

## Design guidelines for new shapes

- Prefer **one clear responsibility** per export; compose with `lerp`, `reflectX`, and existing meta-shapers instead of duplicating ease-in/out pairs.
- Keep parameters **interpretable** on the docs sliders (0–1 biases, gain ≥ 1, etc.).
- Match naming and parameter order of similar functions (`gain`, `bias`, `edge0` / `edge1`, `x` / `y` handles).
- Cite external references in JSDoc when porting Flong, iq, Penner, or Wikipedia formulas.

## Questions

Open an issue at [github.com/danielgamage/data-lathe/issues](https://github.com/danielgamage/data-lathe/issues) if you are unsure whether a function belongs in the core library or only in the docs registry.
