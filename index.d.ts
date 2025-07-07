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
/**
 * Classic tanh function with a simple drive parameter
 */
export declare const tanh: (x: any, gain?: number) => number;
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
 * Hard angle version of smoothStep
 */
export declare const linearStep: (input: number, x: number, y: number) => number;
/**
 * 3-point polyline
 */
export declare const polyline: (input: number, midpointX: number, midpointY: number) => number;
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
