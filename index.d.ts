/**
 * Maps bipolar numbers [-1, 1] to the unipolar closed unit interval [0, 1]
 */
export declare const biToUni: (v: number) => number;
/**
 * Maps unipolar numbers [0, 1] to the bipolar closed interval [-1, 1]
 */
export declare const uniToBi: (v: number) => number;
/**
 * Maps a number from one range to another, optionally clamping it to the input range
 */
export declare const remapRange: (input: number, inputMin?: number, inputMax?: number, outputMin?: number, outputMax?: number, clampInput?: boolean) => number;
/**
 * Clamps overflowing numbers within the closed interval [min, max]
 */
export declare const clamp: (x: number, min: number, max: number) => number;
/**
 * Linearly interpolates `input` in [0,1] between `a` and `b`
 */
export declare const lerp: (input: number, a: number, b: number) => number;
export declare const mix: (input: number, a: number, b: number) => number;
/**
 * Calls function `fn` while producing an output with Y symmetry around 0.
 */
export declare const mirrorAcrossY: (input: number, fn: any, ...args: any[]) => any;
/**
 * Calls function `fn` while producing an output with X and Y symmetry around 0,0.
 * Effectively turns any saturating function that maps in the range [0,1] into a sigmoid.
 */
export declare const mirrorAcrossOrigin: (input: number, fn: any, ...args: any[]) => any;
/**
 * Calls function `fn` reflected across the point at `x`, `y`
 */
export declare function inflectionThroughPoint<Fn extends (...args: any[]) => number>(input: any, x: any, y: any, fn: Fn, ...args: Omit<Parameters<Fn>, "input">): any;
/**
 * Reflects a function across the line `x = 0.5`.
 * Effectively turns ease-out into ease-in (and vice versa).
 */
export declare function reflectX<Fn extends (...args: any[]) => number>(input: number, fn: Fn, ...args: any[]): number;
/**
 * @see http://www.flong.com/archive/texts/code/shapers_poly/index.html
 */
export declare const quadraticThroughAGivenPoint: (input: number, x: number, y: number, clamped?: boolean) => number;
/**
 * Parametric easing function
 */
export declare const ease: (input: number, order?: number) => number;
/**
 * @see http://www.flong.com/archive/texts/code/shapers_bez/index.html
 */
export declare const quadraticBezier: (input: number, x: number, y: number) => number;
/**
 * Implements quadratic bezier curve with a simplified `bias` argument that
 * weights values towards 0 or 1.
 */
export declare const quadraticSlope: (input: number, bias: number) => number;
/**
 * @see http://www.flong.com/archive/texts/code/shapers_exp/
 */
export declare const doubleExponentialSigmoid: (x: number, a: number) => number;
/**
 * @see http://www.flong.com/archive/texts/code/shapers_exp/index.html
 */
export declare const doubleExponentialSeat: (input: number, a: number) => number;
export declare const cubicSlope: (input: number, bias: number, tension?: number) => number;
/**
 * @see http://www.flong.com/archive/texts/code/shapers_bez/index.html
 */
export declare const cubicBezier: (x: number, x1: number, y1: number, x2: number, y2: number) => number;
/**
 * Snaps values to nearest multiple of `step`
 */
export declare const quantize: (input: number, step: number, algorithm?: "round" | "ceil" | "floor") => number;
export declare const fold: (input: number, gain: number) => number;
export declare const sineFold: (input: number, gain: number) => number;
/**
 * Calculates a circular arc through the source points with a variable radius.
 * Mixes a couple of implementations, one using θ, the other using y
 * @see https://math.stackexchange.com/questions/1779414/2d-parametric-equation-for-an-arc-between-two-points-with-a-start-angle
 * @see https://math.stackexchange.com/questions/3286848/equation-of-an-arbitrary-circular-arc
 */
export declare const circularArc: (input: number, bias: number) => number;
/**
 * An automatic bi version of the logistic sigmoid function
 */
export declare const logistic: (input: number, gain: number) => number;
/**
 * @see https://www.flong.com/archive/texts/code/shapers_poly/
 */
export declare const doubleCubicSeat: (input: number, x: number, y: number) => number;
/**
 * @see https://www.flong.com/archive/texts/code/shapers_poly/
 */
export declare const doubleCubicSeatWithLinearBlend: (input: number, x: number, b: number) => number;
/**
 * @see https://iquilezles.org/articles/functions/
 */
export declare const pcurve: (x: number, a: number, b: number) => number;
/**
 *
 * @see https://en.wikipedia.org/wiki/Smoothstep#cite_note-5
 */
export declare const smoothStep: (input: number, edge0: number, edge1: number) => number;
/**
 * Perlin's smootherstep: `6x⁵ - 15x⁴ + 10x³`.
 * Continuous first AND second derivatives at the edges.
 */
export declare const smootherStep: (input: number, edge0?: number, edge1?: number) => number;
/**
 * Perlin's 7th-order smoothest step, with continuous derivatives through 3rd order.
 */
export declare const smoothestStep: (input: number, edge0?: number, edge1?: number) => number;
/**
 * Hard angle version of smoothStep
 */
export declare const linearStep: (input: number, x: number, y: number) => number;
/**
 * 3-point polyline
 */
export declare const polyline: (input: number, midpointX: number, midpointY: number) => number;
/**
 * Catmull–Clark subdivision of an open 4-point control polyline:
 * `(0,0) → (x1,y1) → (x2,y2) → (1,1)`, refined `subdivisions` times
 * with the cubic B-spline rules (endpoints pinned).
 *
 * For each refinement step:
 * - Each edge contributes an edge-point  `E = (P_i + P_{i+1}) / 2`
 * - Each interior vertex is replaced with `V = (P_{i-1} + 6·P_i + P_{i+1}) / 8`
 *
 * The input `x` is then sampled against the resulting polyline by linear
 * interpolation between bracketing vertices. Handles producing a
 * non-monotonic x will collapse / loop — keep `x1 < x2` for a function.
 */
export declare const catmullClark: (input: number, x1: number, y1: number, x2: number, y2: number, subdivisions?: number) => number;
/**
 * Centripetal Catmull–Rom spline through `(0,0) → (x1,y1) → (x2,y2) → (1,1)`,
 * sampled by walking the parameter and bracketing on x.
 *
 * `alpha` controls the parameterization:
 *  - `0` → uniform Catmull–Rom (can self-intersect with sharp handles)
 *  - `0.5` → centripetal (recommended; no cusps/loops)
 *  - `1` → chordal
 *
 * `tension` in [0,1] slackens the curve; `0` is standard Catmull–Rom,
 * `1` collapses to the control polyline.
 *
 * Endpoints are pinned by mirroring the first/last interior segments to
 * synthesize phantom control points P0 and P5.
 */
export declare const catmullRom: (input: number, x1: number, y1: number, x2: number, y2: number, alpha?: number, tension?: number, samples?: number) => number;
/**
 * Cubic soft-clipper: `x - x³/3`, clamped beyond ±1 then renormalized.
 * Cheap, "analog"-flavored alternative to `tanh`.
 */
export declare const softClipCubic: (x: number, gain?: number) => number;
/**
 * Classic tanh function with a simple drive parameter
 */
export declare const tanh: (x: any, gain?: number) => number;
/**
 * Algebraic sigmoid: `x / sqrt(1 + (x)²)`.
 * Cheap saturator with no `exp` call. Bipolar in/out.
 */
export declare const algebraicSigmoid: (x: number, gain?: number) => number;
/**
 * Scaled Arctangent sigmoid
 */
export declare const arctangentSigmoid: (x: number, gain?: number) => number;
/**
 * Softsign function, supposedly faster than `tanh`
 */
export declare const softsign: (x: number, gain?: number) => number;
/**
 * Gudermannian-style saturator, normalized to ±1.
 * Similar shape to `tanh` with a slightly different rolloff.
 */
export declare const gudermannian: (x: number, gain?: number) => number;
/**
 * Reinhard tone-map style saturator: `gx / (1 + |gx|)`. Bipolar in/out.
 */
export declare const reinhard: (x: number, gain?: number) => number;
/**
 * Chebyshev polynomial of the first kind, order 2..5.
 * Each order excites a specific harmonic when used as a waveshaper.
 * Input expected in [-1, 1].
 */
export declare const chebyshev: (x: number, order?: number) => number;
/**
 * Half-wave-rectified power shaper: `max(0, x)^exponent`.
 * Useful for diode-style asymmetric processing.
 */
export declare const halfWave: (x: number, exponent?: number) => number;
/**
 * Penner-style elastic ease-out (oscillating overshoot near `input=0`).
 * Input expected in [0, 1].
 */
export declare const easeElastic: (input: number, amplitude?: number, period?: number) => number;
/**
 * Penner-style bounce ease-out.
 */
export declare const easeBounce: (input: number) => number;
/**
 * Penner-style "back" ease-out: overshoots `1` slightly before settling.
 */
export declare const easeBack: (input: number, overshoot?: number) => number;
/**
 * Exponential ease: `(base^input - 1) / (base - 1)`.
 * Common in animation libraries.
 */
export declare const easeExponential: (input: number, base?: number) => number;
/**
 * Schlick bias: maps [0,1]→[0,1], biases values toward 0 or 1.
 * `bias = 0.5` is the identity. Lower values pull output toward 0; higher toward 1.
 */
export declare const schlick: (input: number, bias?: number) => number;
/**
 * Logit (inverse of the logistic sigmoid). Bipolar in, bipolar out (clipped).
 */
export declare const logit: (input: number, gain?: number) => number;
/**
 * Gaussian bump centered at `mean` with width `sigma`, peak `1`.
 */
export declare const gaussian: (input: number, mean?: number, sigma?: number) => number;
/**
 * Hann (raised-cosine) window over [0,1], with peak `1` at `0.5`.
 */
export declare const hann: (input: number, mean?: number) => number;
/**
 * Hyperbolic cosine window: `cosh(x * taper)`, with `x` in [-1,1] and `taper` controlling the curvature.
 */
export declare const hyperbolicCosine: (x: number, taper?: number, mean?: number) => number;
/**
 * Tukey window: cosine-tapered flat top.
 * `taper = 0` is rectangular, `taper = 1` is a Hann window.
 */
export declare const tukey: (input: number, taper?: number, mean?: number) => number;
/**
 * Sawtooth wave with period 1, range [0, 1]. Also a phasor since it's not band-limited.
 */
export declare const sawtoothWave: (input: number, phase?: number) => number;
/**
 * Triangle wave with period 1, range [0, 1].
 */
export declare const triangleWave: (input: number, phase?: number) => number;
/**
 * Pulse wave with adjustable duty cycle, range {0, 1}.
 */
export declare const pulseWave: (input: number, duty?: number, phase?: number) => 0 | 1;
