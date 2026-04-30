// =================================================
// Utilities
// =================================================
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
const mix = lerp;
/**
 * Calls function `fn` while producing an output with Y symmetry around 0.
 */
const mirrorAcrossY = (
/** input */
input, 
/** function to mirror */
fn, 
/** args passed to the function */
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
}
/**
 * Reflects a function across the line `x = 0.5`.
 * Effectively turns ease-out into ease-in (and vice versa).
 */
function reflectX(input, fn, ...args) {
    return 1 - fn(1 - input, ...args);
}
// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
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
 * Perlin's smootherstep: `6x⁵ - 15x⁴ + 10x³`.
 * Continuous first AND second derivatives at the edges.
 */
const smootherStep = (input, edge0 = 0, edge1 = 1) => {
    if (input < edge0)
        return 0;
    if (input >= edge1)
        return 1;
    const x = (input - edge0) / (edge1 - edge0);
    return x * x * x * (x * (x * 6 - 15) + 10);
};
/**
 * Perlin's 7th-order smoothest step, with continuous derivatives through 3rd order.
 */
const smoothestStep = (input, edge0 = 0, edge1 = 1) => {
    if (input < edge0)
        return 0;
    if (input >= edge1)
        return 1;
    const x = (input - edge0) / (edge1 - edge0);
    return x * x * x * x * (-20 * x * x * x + 70 * x * x - 84 * x + 35);
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
const catmullClark = (input, x1, y1, x2, y2, subdivisions = 3) => {
    let pts = [
        [0, 0],
        [x1, y1],
        [x2, y2],
        [1, 1],
    ];
    const steps = Math.max(0, Math.floor(subdivisions));
    for (let s = 0; s < steps; s++) {
        const next = [pts[0]];
        for (let i = 0; i < pts.length - 1; i++) {
            const a = pts[i];
            const b = pts[i + 1];
            // edge point
            next.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
            // vertex point for the interior vertex b (skip if b is the last point)
            if (i + 1 < pts.length - 1) {
                const c = pts[i + 2];
                next.push([(a[0] + 6 * b[0] + c[0]) / 8, (a[1] + 6 * b[1] + c[1]) / 8]);
            }
        }
        next.push(pts[pts.length - 1]);
        pts = next;
    }
    if (input <= pts[0][0])
        return pts[0][1];
    const last = pts[pts.length - 1];
    if (input >= last[0])
        return last[1];
    for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        if (input >= a[0] && input <= b[0]) {
            const t = (input - a[0]) / (b[0] - a[0] + epsilon);
            return lerp(t, a[1], b[1]);
        }
    }
    return last[1];
};
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
const catmullRom = (input, x1, y1, x2, y2, alpha = 0.5, tension = 0, samples = 64) => {
    const P1 = [0, 0];
    const P2 = [x1, y1];
    const P3 = [x2, y2];
    const P4 = [1, 1];
    // phantom endpoints by reflection
    const P0 = [2 * P1[0] - P2[0], 2 * P1[1] - P2[1]];
    const P5 = [2 * P4[0] - P3[0], 2 * P4[1] - P3[1]];
    const ctrl = [P0, P1, P2, P3, P4, P5];
    const tj = (ti, a, b) => {
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        return Math.pow(Math.sqrt(dx * dx + dy * dy) + epsilon, alpha) + ti;
    };
    // Build a polyline by sampling each of the 3 interior segments
    const pts = [];
    const segs = Math.max(1, Math.floor(samples / 3));
    for (let s = 0; s < 3; s++) {
        const p0 = ctrl[s];
        const p1 = ctrl[s + 1];
        const p2 = ctrl[s + 2];
        const p3 = ctrl[s + 3];
        const t0 = 0;
        const t1 = tj(t0, p0, p1);
        const t2 = tj(t1, p1, p2);
        const t3 = tj(t2, p2, p3);
        const last = s === 2;
        const count = last ? segs + 1 : segs;
        for (let i = 0; i < count; i++) {
            const u = i / segs;
            let t = lerp(u, t1, t2);
            // tension slackens by pulling t toward the segment midpoint
            const mid = (t1 + t2) / 2;
            t = lerp(tension, t, mid);
            const A1x = ((t1 - t) / (t1 - t0)) * p0[0] + ((t - t0) / (t1 - t0)) * p1[0];
            const A1y = ((t1 - t) / (t1 - t0)) * p0[1] + ((t - t0) / (t1 - t0)) * p1[1];
            const A2x = ((t2 - t) / (t2 - t1)) * p1[0] + ((t - t1) / (t2 - t1)) * p2[0];
            const A2y = ((t2 - t) / (t2 - t1)) * p1[1] + ((t - t1) / (t2 - t1)) * p2[1];
            const A3x = ((t3 - t) / (t3 - t2)) * p2[0] + ((t - t2) / (t3 - t2)) * p3[0];
            const A3y = ((t3 - t) / (t3 - t2)) * p2[1] + ((t - t2) / (t3 - t2)) * p3[1];
            const B1x = ((t2 - t) / (t2 - t0)) * A1x + ((t - t0) / (t2 - t0)) * A2x;
            const B1y = ((t2 - t) / (t2 - t0)) * A1y + ((t - t0) / (t2 - t0)) * A2y;
            const B2x = ((t3 - t) / (t3 - t1)) * A2x + ((t - t1) / (t3 - t1)) * A3x;
            const B2y = ((t3 - t) / (t3 - t1)) * A2y + ((t - t1) / (t3 - t1)) * A3y;
            const Cx = ((t2 - t) / (t2 - t1)) * B1x + ((t - t1) / (t2 - t1)) * B2x;
            const Cy = ((t2 - t) / (t2 - t1)) * B1y + ((t - t1) / (t2 - t1)) * B2y;
            pts.push([Cx, Cy]);
        }
    }
    // sample by x
    if (input <= pts[0][0])
        return pts[0][1];
    const last = pts[pts.length - 1];
    if (input >= last[0])
        return last[1];
    for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        if ((input >= a[0] && input <= b[0]) || (input <= a[0] && input >= b[0])) {
            const t = (input - a[0]) / (b[0] - a[0] + epsilon);
            return lerp(t, a[1], b[1]);
        }
    }
    return last[1];
};
// ---------------------------------------------------------------------------
// DSP / saturation
// ---------------------------------------------------------------------------
/**
 * Cubic soft-clipper: `x - x³/3`, clamped beyond ±1 then renormalized.
 * Cheap, "analog"-flavored alternative to `tanh`.
 */
const softClipCubic = (x, gain = 1) => {
    const v = clamp(x * gain, -1, 1);
    // peak of (v - v³/3) at |v|=1 is 2/3, so scale by 3/2
    return 1.5 * (v - (v * v * v) / 3);
};
// ---------------------------------------------------------------------------
// Sigmoids
// ---------------------------------------------------------------------------
/**
 * Classic tanh function with a simple drive parameter
 */
const tanh = (x, gain = 1) => {
    const y = Math.tanh(x * gain);
    return y;
};
/**
 * Algebraic sigmoid: `x / sqrt(1 + (x)²)`.
 * Cheap saturator with no `exp` call. Bipolar in/out.
 */
const algebraicSigmoid = (x, gain = 1) => {
    const drivenX = x * gain;
    return drivenX / Math.sqrt(1 + drivenX * drivenX);
};
/**
 * Scaled Arctangent sigmoid
 */
const arctangentSigmoid = (x, gain = 1) => {
    return (2 / Math.PI) * Math.atan((Math.PI / 2) * x * gain);
};
/**
 * Softsign function, supposedly faster than `tanh`
 */
const softsign = (x, gain = 1) => {
    const drivenX = x * gain;
    return drivenX / (1 + Math.abs(drivenX));
};
/**
 * Gudermannian-style saturator, normalized to ±1.
 * Similar shape to `tanh` with a slightly different rolloff.
 */
const gudermannian = (x, gain = 1) => {
    return (4 / Math.PI) * Math.atan(Math.tanh((x * gain) / 2));
};
/**
 * Reinhard tone-map style saturator: `gx / (1 + |gx|)`. Bipolar in/out.
 */
const reinhard = (x, gain = 1) => {
    const gx = x * gain;
    return gx / (1 + Math.abs(gx));
};
/**
 * Chebyshev polynomial of the first kind, order 2..5.
 * Each order excites a specific harmonic when used as a waveshaper.
 * Input expected in [-1, 1].
 */
const chebyshev = (x, order = 2) => {
    return Math.cos(order * Math.acos(2.0 * clamp(x, 0, 1) - 1.0));
};
/**
 * Half-wave-rectified power shaper: `max(0, x)^exponent`.
 * Useful for diode-style asymmetric processing.
 */
const halfWave = (x, exponent = 1) => x > 0 ? Math.pow(x, Math.max(epsilon, exponent)) : 0;
// ---------------------------------------------------------------------------
// Easings / animation
// ---------------------------------------------------------------------------
/**
 * Penner-style elastic ease-out (oscillating overshoot near `input=0`).
 * Input expected in [0, 1].
 */
const easeElastic = (input, amplitude = 1, period = 0.3) => {
    if (input <= 0)
        return 0;
    if (input >= 1)
        return 1;
    const a = Math.max(amplitude, 1);
    const p = Math.max(period, epsilon);
    const s = (p / (2 * Math.PI)) * Math.asin(1 / a);
    return (a * Math.pow(2, -10 * input) * Math.sin(((input - s) * (2 * Math.PI)) / p) +
        1);
};
/**
 * Penner-style bounce ease-out.
 */
const easeBounce = (input) => {
    const n = 7.5625;
    const d = 2.75;
    if (input < 1 / d)
        return n * input * input;
    if (input < 2 / d) {
        input -= 1.5 / d;
        return n * input * input + 0.75;
    }
    if (input < 2.5 / d) {
        input -= 2.25 / d;
        return n * input * input + 0.9375;
    }
    input -= 2.625 / d;
    return n * input * input + 0.984375;
};
/**
 * Penner-style "back" ease-out: overshoots `1` slightly before settling.
 */
const easeBack = (input, overshoot = 1.70158) => {
    const c1 = overshoot;
    const c3 = c1 + 1;
    const x = input - 1;
    return 1 + c3 * x * x * x + c1 * x * x;
};
/**
 * Exponential ease: `(base^input - 1) / (base - 1)`.
 * Common in animation libraries.
 */
const easeExponential = (input, base = 2) => {
    const b = Math.max(base, 1 + epsilon);
    if (input <= 0)
        return 0;
    if (input >= 1)
        return 1;
    return (Math.pow(b, input) - 1) / (b - 1);
};
// ---------------------------------------------------------------------------
// Bias / gain
// ---------------------------------------------------------------------------
/**
 * Schlick bias: maps [0,1]→[0,1], biases values toward 0 or 1.
 * `bias = 0.5` is the identity. Lower values pull output toward 0; higher toward 1.
 */
const schlick = (input, bias = 0.5) => {
    const b = clamp(bias, epsilon, 1 - epsilon);
    return input / ((1 / b - 2) * (1 - input) + 1);
};
/**
 * Logit (inverse of the logistic sigmoid). Bipolar in, bipolar out (clipped).
 */
const logit = (input, gain = 1) => {
    const x = clamp(biToUni(input), epsilon, 1 - epsilon);
    return Math.log(x / (1 - x)) / Math.max(gain, epsilon);
};
// ---------------------------------------------------------------------------
// Windowing
// ---------------------------------------------------------------------------
/**
 * Gaussian bump centered at `mean` with width `sigma`, peak `1`.
 */
const gaussian = (input, mean = 0.5, sigma = 0.15) => {
    const s = Math.max(sigma, epsilon);
    const d = (input - mean) / s;
    return Math.exp(-d * d);
};
/**
 * Hann (raised-cosine) window over [0,1], with peak `1` at `0.5`.
 */
const hann = (input, mean = 0.5) => {
    mean -= 0.5;
    input = input - mean;
    if (input <= 0 || input >= 1)
        return 0;
    return 0.5 * (1 - Math.cos(2 * Math.PI * input));
};
/**
 * Hyperbolic cosine window: `cosh(x * taper)`, with `x` in [-1,1] and `taper` controlling the curvature.
 */
const hyperbolicCosine = (x, taper = 1, mean = 0) => {
    return 1 / Math.cosh((x - mean) * taper);
};
/**
 * Tukey window: cosine-tapered flat top.
 * `taper = 0` is rectangular, `taper = 1` is a Hann window.
 */
const tukey = (input, taper = 0.5, mean = 0.5) => {
    mean -= 0.5;
    input = input - mean;
    if (input <= 0 || input >= 1)
        return 0;
    const a = clamp(taper, 0, 1);
    if (a === 0)
        return 1;
    if (input < a / 2)
        return 0.5 * (1 + Math.cos(Math.PI * ((2 * input) / a - 1)));
    if (input > 1 - a / 2)
        return 0.5 * (1 + Math.cos(Math.PI * ((2 * input) / a - 2 / a + 1)));
    return 1;
};
// ---------------------------------------------------------------------------
// Periodic
// ---------------------------------------------------------------------------
/**
 * Sawtooth wave with period 1, range [0, 1]. Also a phasor since it's not band-limited.
 */
const sawtoothWave = (input, phase = 0) => {
    return (((input + phase) % 1) + 1) % 1;
};
/**
 * Triangle wave with period 1, range [0, 1].
 */
const triangleWave = (input, phase = 0) => {
    const x = sawtoothWave(input, phase);
    return 2 * Math.abs(x - 0.5);
};
/**
 * Pulse wave with adjustable duty cycle, range {0, 1}.
 */
const pulseWave = (input, duty = 0.5, phase = 0) => {
    const x = sawtoothWave(input, phase);
    return x < clamp(duty, 0, 1) ? 1 : 0;
};export{algebraicSigmoid,arctangentSigmoid,biToUni,catmullClark,catmullRom,chebyshev,circularArc,clamp,cubicBezier,cubicSlope,doubleCubicSeat,doubleCubicSeatWithLinearBlend,doubleExponentialSeat,doubleExponentialSigmoid,ease,easeBack,easeBounce,easeElastic,easeExponential,fold,gaussian,gudermannian,halfWave,hann,hyperbolicCosine,inflectionThroughPoint,lerp,linearStep,logistic,logit,mirrorAcrossOrigin,mirrorAcrossY,mix,pcurve,polyline,pulseWave,quadraticBezier,quadraticSlope,quadraticThroughAGivenPoint,quantize,reflectX,reinhard,remapRange,sawtoothWave,schlick,sineFold,smoothStep,smootherStep,smoothestStep,softClipCubic,softsign,tanh,triangleWave,tukey,uniToBi};