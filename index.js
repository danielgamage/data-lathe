/**
 * Helper to prevent x÷0 (example)
 */
const epsilon = Number.EPSILON;
/**
 * Maps bipolar numbers [-1, 1] to the unipolar closed unit interval [0, 1]
 */
const biToUni = (v) => v / 2 + 0.5;
/**
 * Maps unipolar numbers [0, 1] to the bipolar closed interval [-1, 1]
 */
const uniToBi = (v) => v * 2 - 1;
/**
 * Maps a number from one range to another, optionally clamping it to the input range
 */
const remapRange = (input, inputMin = 0, inputMax = 1, outputMin = 0, outputMax = 1, clampInput = true) => {
    const clampedInput = clampInput ? clamp(input, inputMin, inputMax) : input;
    const normalized = (clampedInput - inputMin) / (inputMax - inputMin);
    return lerp(normalized, outputMin, outputMax);
};
/**
 * Clamps overflowing numbers within the closed interval [min, max]
 */
const clamp = (x, min, max) => {
    if (x < min) {
        return min;
    }
    if (x > max) {
        return max;
    }
    return x;
};
/**
 * Linearly interpolates `input` in [0,1] between `a` and `b`
 */
const lerp = (input, a, b) => a + (b - a) * input;
/**
 * Classic tanh function with a simple drive parameter
 */
const tanh = (x, gain = 1) => {
    const y = Math.tanh(x * gain);
    return y;
};
/**
 * @see http://www.flong.com/archive/texts/code/shapers_poly/index.html
 */
const quadraticThroughAGivenPoint = (input, x, y, clamped = false) => {
    const min_param_a = 0.0 + epsilon;
    const max_param_a = 1.0 - epsilon;
    const min_param_b = 0.0;
    const max_param_b = 1.0;
    x = Math.min(max_param_a, Math.max(min_param_a, x));
    y = Math.min(max_param_b, Math.max(min_param_b, y));
    const A = (1 - y) / (1 - x) - y / x;
    const B = (A * (x * x) - y) / x;
    let output = A * (input * input) - B * input;
    output = clamped ? Math.min(1, Math.max(0, output)) : output;
    return output;
};
/**
 * Parametric easing function
 */
const ease = (input, 
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
order = 2) => {
    const positiveBias = order >= 0;
    order = Math.abs(order) + 1;
    input = positiveBias ? 1 - input : input;
    const offset = positiveBias ? 1 : 0;
    return offset - (positiveBias ? 1 : -1) * Math.pow(input, order);
};
/**
 * @see http://www.flong.com/archive/texts/code/shapers_bez/index.html
 */
const quadraticBezier = (input, x, y) => {
    // adapted from BEZMATH.PS (1993)
    // by Don Lancaster, SYNERGETICS Inc.
    // http://www.tinaja.com/text/bezmath.html
    if (x === 0.5) {
        return input;
    }
    let a = { x, y };
    a.x = clamp(a.x, 0.0, 1.0);
    a.y = clamp(a.y, 0.0, 1.0);
    if (a.x === 0.5) {
        a.x = a.x + epsilon;
        a.y = a.y + epsilon;
    }
    // solve t from x (an inverse operation)
    let om2a = 1.0 - 2.0 * a.x;
    let t = (Math.sqrt(a.x * a.x + om2a * input) - a.x) / om2a;
    let output = (1.0 - 2.0 * a.y) * (t * t) + 2.0 * a.y * t;
    return output;
};
/**
 * Implements quadratic bezier curve with a simplified `bias` argument that
 * weights values towards 0 or 1.
 */
const quadraticSlope = (input, bias) => {
    return quadraticBezier(input, 1 - bias, bias);
};
/**
 * @see http://www.flong.com/archive/texts/code/shapers_exp/
 */
const doubleExponentialSigmoid = (x, a) => {
    const min_param_a = 0.0 + epsilon;
    const max_param_a = 1.0 - epsilon;
    a = Math.min(max_param_a, Math.max(min_param_a, a));
    a = 1.0 - a; // for sensible results
    let y = 0;
    if (x <= 0.5) {
        y = Math.pow(2.0 * x, 1.0 / a) / 2.0;
    }
    else {
        y = 1.0 - Math.pow(2.0 * (1.0 - x), 1.0 / a) / 2.0;
    }
    return y;
};
/**
 * @see http://www.flong.com/archive/texts/code/shapers_exp/index.html
 */
const doubleExponentialSeat = (input, a) => {
    const min_param_a = 0.0 + epsilon;
    const max_param_a = 1.0 - epsilon;
    a = Math.min(max_param_a, Math.max(min_param_a, a));
    let y = 0;
    if (input <= 0.5) {
        y = Math.pow(2.0 * input, 1 - a) / 2.0;
    }
    else {
        y = 1.0 - Math.pow(2.0 * (1.0 - input), 1 - a) / 2.0;
    }
    return y;
};
const cubicSlope = (input, 
/** range from 0..1 */
bias, 
/** range from 0..1 */
tension = 0.5) => {
    if ([0, 1].includes(input)) {
        return input;
    }
    // Calculate pointA based on bias
    const pointA = [
        tension * (1 - bias),
        tension * bias, // y goes from 0 to 1 as bias goes 0->1
    ];
    // Calculate pointB as the mirrored point of pointA
    const pointB = [1 - pointA[1], 1 - pointA[0]];
    return cubicBezier(input, pointA[0], pointA[1], pointB[0], pointB[1]);
};
/**
 * @see http://www.flong.com/archive/texts/code/shapers_bez/index.html
 */
const cubicBezier = (x, x1, y1, x2, y2) => {
    // Helper functions:
    const slopeFromT = (t, A, B, C) => {
        const dtdx = 1.0 / (3.0 * A * t * t + 2.0 * B * t + C);
        return dtdx;
    };
    const xFromT = (t, A, B, C, D) => {
        const x = A * (t * t * t) + B * (t * t) + C * t + D;
        return x;
    };
    const yFromT = (t, E, F, G, H) => {
        const y = E * (t * t * t) + F * (t * t) + G * t + H;
        return y;
    };
    const y0a = 0.0; // initial y
    const x0a = 0.0; // initial x
    const y1a = y1; // 1st influence y
    const x1a = x1; // 1st influence x
    const y2a = y2; // 2nd influence y
    const x2a = x2; // 2nd influence x
    const y3a = 1.0; // final y
    const x3a = 1.0; // final x
    const A = x3a - 3 * x2a + 3 * x1a - x0a;
    const B = 3 * x2a - 6 * x1a + 3 * x0a;
    const C = 3 * x1a - 3 * x0a;
    const D = x0a;
    const E = y3a - 3 * y2a + 3 * y1a - y0a;
    const F = 3 * y2a - 6 * y1a + 3 * y0a;
    const G = 3 * y1a - 3 * y0a;
    const H = y0a;
    // Solve for t given x (using Newton-Raphelson), then solve for y given t.
    // Assume for the first guess that t = x.
    let currentT = x;
    const nRefinementIterations = 5;
    for (let i = 0; i < nRefinementIterations; i++) {
        const currentX = xFromT(currentT, A, B, C, D);
        const currentSlope = slopeFromT(currentT, A, B, C);
        currentT -= (currentX - x) * currentSlope;
        currentT = clamp(currentT, 0, 1);
    }
    const y = yFromT(currentT, E, F, G, H);
    return y;
};
/**
 * Snaps values to nearest multiple of `step`
 */
const quantize = (input, step, 
/** rounding algorithm used. `floor` or `ceil` may be more useful for data in closed unit intervals */
algorithm = "round") => {
    step = Math.max(epsilon, step);
    return Math[algorithm](input / step) * step;
};
const fold = (input, gain) => {
    input *= gain + 1;
    input = 0.25 * input;
    return biToUni(4 * (Math.abs(input - Math.round(input)) - 0.25));
};
const sineFold = (input, gain) => {
    input *= gain + 1;
    return biToUni(Math.sin((Math.PI * input) / 2 - Math.PI / 2));
};
/**
 * Calculates a circular arc through the source points with a variable radius.
 * Mixes a couple of implementations, one using θ, the other using y
 * @see https://math.stackexchange.com/questions/1779414/2d-parametric-equation-for-an-arc-between-two-points-with-a-start-angle
 * @see https://math.stackexchange.com/questions/3286848/equation-of-an-arbitrary-circular-arc
 */
const circularArc = (input, 
/** range from 0..1 */
bias) => {
    const x0 = 0, y0 = 0, x1 = 1, y1 = 1;
    // avoiding clipping around extremes
    if (input === 0)
        return 0;
    if (input === 1)
        return 1;
    // outputs bias from [0,-0.5]
    const computedBias = (bias * -1) / 2;
    if (bias === 0.5) {
        return input;
    }
    const a0 = computedBias * Math.PI;
    const r = (Math.pow(x0 - x1 + epsilon, 2) + Math.pow(y0 - y1 + epsilon, 2)) /
        (2 * (x0 - x1) * Math.cos(a0) + 2 * (y0 - y1) * Math.sin(a0));
    // const xc = x0 - r * Math.cos(a0)
    const yc = y0 - r * Math.sin(a0);
    const theta = ((Math.acos((input - yc) / r) + Math.PI * 2) % Math.PI) + Math.PI;
    return 1 - (yc + r * Math.sin(theta));
};
/**
 * An automatic bi version of the logistic sigmoid function
 */
const logistic = (input, gain) => {
    return uniToBi(1 / (1 + Math.exp(-gain * input)));
};
/**
 * @see https://www.flong.com/archive/texts/code/shapers_poly/
 */
const doubleCubicSeat = (input, x, y) => {
    const epsilon = 0.00001;
    const min_param_a = 0.0 + epsilon;
    const max_param_a = 1.0 - epsilon;
    const min_param_b = 0.0;
    const max_param_b = 1.0;
    const clampedA = Math.min(max_param_a, Math.max(min_param_a, x));
    const clampedB = Math.min(max_param_b, Math.max(min_param_b, y));
    if (input <= clampedA) {
        return clampedB - clampedB * Math.pow(1 - input / clampedA, 3.0);
    }
    else {
        return (clampedB +
            (1 - clampedB) * Math.pow((input - clampedA) / (1 - clampedA), 3.0));
    }
};
/**
 * @see https://www.flong.com/archive/texts/code/shapers_poly/
 */
const doubleCubicSeatWithLinearBlend = (input, x, b) => {
    const epsilon = 0.00001;
    const min_param_a = 0.0 + epsilon;
    const max_param_a = 1.0 - epsilon;
    const min_param_b = 0.0;
    const max_param_b = 1.0;
    x = Math.min(max_param_a, Math.max(min_param_a, x));
    b = Math.min(max_param_b, Math.max(min_param_b, b));
    b = 1.0 - b; //reverse for intelligibility.
    if (input <= x) {
        return b * input + (1 - b) * x * (1 - Math.pow(1 - input / x, 3.0));
    }
    else {
        return (b * input + (1 - b) * (x + (1 - x) * Math.pow((input - x) / (1 - x), 3.0)));
    }
};
/**
 * @see https://iquilezles.org/articles/functions/
 */
const pcurve = (x, a, b) => {
    const k = Math.pow(a + b, a + b) / (Math.pow(a, a) * Math.pow(b, b));
    return k * Math.pow(x, a) * Math.pow(1.0 - x, b);
};
/**
 *
 * @see https://en.wikipedia.org/wiki/Smoothstep#cite_note-5
 */
const smoothStep = (input, edge0, edge1) => {
    if (input < edge0)
        return 0;
    if (input >= edge1)
        return 1;
    // Scale/bias into [0..1] range
    input = (input - edge0) / (edge1 - edge0);
    return input * input * (3 - 2 * input);
};
/**
 * Hard angle version of smoothStep
 */
const linearStep = (input, x, y) => {
    return clamp((input - x) / (y - x), 0, 1);
};
/**
 * 3-point polyline
 */
const polyline = (input, midpointX, midpointY) => {
    const slopeA = (midpointY - 0) / (midpointX - 0);
    const slopeB = (1 - midpointY) / (1 - midpointX);
    return input < midpointX
        ? slopeA * input
        : slopeB * input - slopeB * midpointX + midpointY;
};
/**
 * Calls function `fn` while producing an output with Y symmetry around 0.
 */
const mirrorAcrossY = (
/** input */
input, 
/** function to mirror */
fn, 
/** args paszsed to the function */
...args) => fn(Math.abs(input), ...args);
/**
 * Calls function `fn` while producing an output with X and Y symmetry around 0,0.
 * Effectively turns any saturating function that maps in the range [0,1] into a sigmoid.
 */
const mirrorAcrossOrigin = (
/** input */
input, 
/** function to mirror */
fn, 
/** args paszsed to the function */
...args) => {
    let absOut = fn(Math.abs(input), ...args);
    return input < 0 ? absOut * -1 : absOut;
};
/**
 * Calls function `fn` reflected across the point at `x`, `y`
 */
function inflectionThroughPoint(input, x, y, fn, ...args) {
    if (input <= x) {
        return fn(input / (x + epsilon), ...args) * y;
    }
    else {
        return (1 - fn(1 - (input - x) / (1 - x + epsilon), ...args)) * (1 - y) + y;
        // input scaled to 0 1
    }
}export{biToUni,circularArc,clamp,cubicBezier,cubicSlope,doubleCubicSeat,doubleCubicSeatWithLinearBlend,doubleExponentialSeat,doubleExponentialSigmoid,ease,fold,inflectionThroughPoint,lerp,linearStep,logistic,mirrorAcrossOrigin,mirrorAcrossY,pcurve,polyline,quadraticBezier,quadraticSlope,quadraticThroughAGivenPoint,quantize,remapRange,sineFold,smoothStep,tanh,uniToBi};