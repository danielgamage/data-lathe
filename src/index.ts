/**
 * Helper to prevent x÷0 (example)
 */
const epsilon = Number.EPSILON

/**
 * Maps bipolar numbers [-1, 1] to the unipolar closed unit interval [0, 1]
 */
export const biToUni = (v: number) => v / 2 + 0.5
/**
 * Maps unipolar numbers [0, 1] to the bipolar closed interval [-1, 1]
 */
export const uniToBi = (v: number) => v * 2 - 1

/**
 * Clamps overflowing numbers within the closed interval [min, max]
 */
export const clamp = (x: number, min: number, max: number) => {
  if (x < min) {
    return min
  }
  if (x > max) {
    return max
  }
  return x
}

/**
 * Linearly interpolates `input` in [0,1] between `a` and `b`
 */
export const lerp = (input: number, a: number, b: number) => a + (b - a) * input

/**
 * Classic tanh function with a simple drive parameter
 */
export const tanh = (x, gain = 1) => {
  const y = Math.tanh(x * gain)
  return y
}

/**
 * @see http://www.flong.com/archive/texts/code/shapers_poly/index.html
 */
export const quadraticThroughAGivenPoint = (
  input: number,
  x: number,
  y: number,
  clamped = false
) => {
  const min_param_a = 0.0 + epsilon
  const max_param_a = 1.0 - epsilon
  const min_param_b = 0.0
  const max_param_b = 1.0
  x = Math.min(max_param_a, Math.max(min_param_a, x))
  y = Math.min(max_param_b, Math.max(min_param_b, y))

  const A = (1 - y) / (1 - x) - y / x
  const B = (A * (x * x) - y) / x
  let output = A * (input * input) - B * input
  output = clamped ? Math.min(1, Math.max(0, output)) : output

  return output
}

/**
 * Parametric easing function
 */
export const ease = (
  input: number,
  /**
   * This determines the strength of the curve from 0-index
   * (+1 is added to the value to derive the order, allowing for smooth through-0 transitions)
   * - 0 = linear
   * - 1 = quadratic
   * - 2 = cubic
   * - 3 = quartic
   * - 4 = quintic
   * Positive values bias towards ease-out, negative values bias towards ease-in
   */
  order: number = 2
): number => {
  const positiveBias = order >= 0
  order = Math.abs(order) + 1
  input = positiveBias ? 1 - input : input
  const offset = positiveBias ? 1 : 0
  return offset - (positiveBias ? 1 : -1) * Math.pow(input, order)
}

/**
 * @see http://www.flong.com/archive/texts/code/shapers_bez/index.html
 */
export const quadraticBezier = (input: number, x: number, y: number) => {
  // adapted from BEZMATH.PS (1993)
  // by Don Lancaster, SYNERGETICS Inc.
  // http://www.tinaja.com/text/bezmath.html

  let a = { x, y }
  a.x = clamp(a.x, 0.0, 1.0)
  a.y = clamp(a.y, 0.0, 1.0)
  if (a.x === 0.5) {
    a.x = a.x + epsilon
    a.y = a.y + epsilon
  }

  // solve t from x (an inverse operation)
  let om2a = 1.0 - 2.0 * a.x
  let t = (Math.sqrt(a.x * a.x + om2a * input) - a.x) / om2a
  let output = (1.0 - 2.0 * a.y) * (t * t) + 2.0 * a.y * t
  return output
}

/**
 * Implements quadratic bezier curve with a simplified `bias` argument that
 * weights values towards 0 or 1.
 */
export const quadraticSlope = (input: number, bias: number) => {
  return quadraticBezier(input, 1 - bias, bias)
}

/**
 * @see http://www.flong.com/archive/texts/code/shapers_exp/
 */
export const doubleExponentialSigmoid = (x: number, a: number) => {
  const min_param_a = 0.0 + epsilon
  const max_param_a = 1.0 - epsilon
  a = Math.min(max_param_a, Math.max(min_param_a, a))
  a = 1.0 - a // for sensible results

  let y = 0
  if (x <= 0.5) {
    y = Math.pow(2.0 * x, 1.0 / a) / 2.0
  } else {
    y = 1.0 - Math.pow(2.0 * (1.0 - x), 1.0 / a) / 2.0
  }
  return y
}
/**
 * @see http://www.flong.com/archive/texts/code/shapers_exp/index.html
 */
export const doubleExponentialSeat = (input: number, a: number) => {
  const min_param_a = 0.0 + epsilon
  const max_param_a = 1.0 - epsilon
  a = Math.min(max_param_a, Math.max(min_param_a, a))

  let y = 0
  if (input <= 0.5) {
    y = Math.pow(2.0 * input, 1 - a) / 2.0
  } else {
    y = 1.0 - Math.pow(2.0 * (1.0 - input), 1 - a) / 2.0
  }
  return y
}

/**
 * Snaps values to nearest multiple of `step`
 */
export const quantize = (
  input: number,
  step: number,
  /** rounding algorithm used. `floor` or `ceil` may be more useful for data in closed unit intervals */
  algorithm: "round" | "ceil" | "floor" = "round"
) => {
  step = Math.max(epsilon, step)
  return Math[algorithm](input / step) * step
}

export const fold = (input: number, gain: number) => {
  input *= gain + 1
  input = 0.25 * input
  return biToUni(4 * (Math.abs(input - Math.round(input)) - 0.25))
}
export const sineFold = (input: number, gain: number) => {
  input *= gain + 1
  return biToUni(Math.sin((Math.PI * input) / 2 - Math.PI / 2))
}

/**
 * Calculates a circular arc through the source points with a variable radius.
 * Mixes a couple of implementations, one using θ, the other using y
 * @see https://math.stackexchange.com/questions/1779414/2d-parametric-equation-for-an-arc-between-two-points-with-a-start-angle
 * @see https://math.stackexchange.com/questions/3286848/equation-of-an-arbitrary-circular-arc
 */
export const circularArc = (
  input: number,
  /** range from 0..1 */
  bias: number
) => {
  const x0 = 0,
    y0 = 0,
    x1 = 1,
    y1 = 1

  // avoiding clipping around extremes
  if (input === 0) return 0
  if (input === 1) return 1

  // outputs bias from [0,-0.5]
  const computedBias = (bias * -1) / 2
  if (bias === 0.5) {
    return input
  }

  const a0 = computedBias * Math.PI

  const r =
    (Math.pow(x0 - x1 + epsilon, 2) + Math.pow(y0 - y1 + epsilon, 2)) /
    (2 * (x0 - x1) * Math.cos(a0) + 2 * (y0 - y1) * Math.sin(a0))
  // const xc = x0 - r * Math.cos(a0)
  const yc = y0 - r * Math.sin(a0)
  const theta =
    ((Math.acos((input - yc) / r) + Math.PI * 2) % Math.PI) + Math.PI
  return 1 - (yc + r * Math.sin(theta))
}

/**
 * An automatic bi version of the logistic sigmoid function
 */
export const logistic = (input: number, gain: number) => {
  return uniToBi(1 / (1 + Math.exp(-gain * input)))
}

/**
 *
 * @see https://en.wikipedia.org/wiki/Smoothstep#cite_note-5
 */
export const smoothStep = (input: number, edge0: number, edge1: number) => {
  if (input < edge0) return 0
  if (input >= edge1) return 1

  // Scale/bias into [0..1] range
  input = (input - edge0) / (edge1 - edge0)

  return input * input * (3 - 2 * input)
}

/**
 * Hard angle version of smoothStep
 */
export const linearStep = (input: number, x: number, y: number) => {
  return clamp((input - x) / (y - x), 0, 1)
}

/**
 * 3-point polyline
 */
export const polyline = (
  input: number,
  midpointX: number,
  midpointY: number
) => {
  const slopeA = (midpointY - 0) / (midpointX - 0)
  const slopeB = (1 - midpointY) / (1 - midpointX)
  return input < midpointX
    ? slopeA * input
    : slopeB * input - slopeB * midpointX + midpointY
}

/**
 * Calls function `fn` while producing an output with Y symmetry around 0.
 */
export const mirrorAcrossY = (
  /** input */
  input: number,
  /** function to mirror */
  fn,
  /** args paszsed to the function */
  ...args
) => fn(Math.abs(input), ...args)

/**
 * Calls function `fn` while producing an output with X and Y symmetry around 0,0.
 * Effectively turns any saturating function that maps in the range [0,1] into a sigmoid.
 */
export const mirrorAcrossOrigin = (
  /** input */
  input: number,
  /** function to mirror */
  fn,
  /** args paszsed to the function */
  ...args
) => {
  let absOut = fn(Math.abs(input), ...args)
  return input < 0 ? absOut * -1 : absOut
}
/**
 * Calls function `fn` reflected across the point at `x`, `y`
 */
export function inflectionThroughPoint<Fn extends (...args: any[]) => number>(
  input,
  x,
  y,
  fn: Fn,
  ...args: Omit<Parameters<Fn>, "input">
) {
  if (input <= x) {
    return fn(input / (x + epsilon), ...args) * y
  } else {
    return (1 - fn(1 - (input - x) / (1 - x + epsilon), ...args)) * (1 - y) + y
    // input scaled to 0 1
  }
}

const functions = {
  biToUni,
  uniToBi,
  clamp,
  lerp,
  tanh,
  quadraticThroughAGivenPoint,
  quadraticBezier,
  quadraticSlope,
  doubleExponentialSigmoid,
  doubleExponentialSeat,
  quantize,
  fold,
  sineFold,
  circularArc,
  logistic,
  smoothStep,
  linearStep,
  polyline,
  mirrorAcrossY,
  mirrorAcrossOrigin,
  inflectionThroughPoint,
}

export default functions
