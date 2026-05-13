import * as lathe from "data-lathe"

export const functions = [
  {
    name: "uniToBi",
    fn: lathe.uniToBi,
    features: { bidi: true },
    tags: ["utility"],
  },
  {
    name: "biToUni",
    fn: lathe.biToUni,
    features: { bidi: true },
    tags: ["utility"],
  },
  {
    name: "clamp",
    fn: lathe.clamp,
    params: [
      { name: "min", default: 0.25, min: -1, max: 1 },
      { name: "max", default: 0.75, min: -1, max: 1 },
    ],
    tags: ["utility"],
  },
  {
    name: "remapRange",
    fn: lathe.remapRange,
    params: [
      { name: "fromMin", default: 0, min: -1, max: 1 },
      { name: "fromMax", default: 1, min: -1, max: 1 },
      { name: "toMin", default: 0.25, min: -1, max: 1 },
      { name: "toMax", default: 0.75, min: -1, max: 1 },
    ],
    tags: ["utility"],
  },
  {
    name: "ease",
    fn: lathe.ease,
    features: { mirrorXY: true },
    params: [{ name: "order", default: 3, min: -6, max: 6 }],
    tags: ["curve"],
  },
  {
    name: "circularArc",
    fn: lathe.circularArc,
    features: { mirrorXY: true },
    params: [{ name: "bias", default: 1, min: 0, max: 1 }],
    y: "bias",
    tags: ["curve"],
  },
  {
    name: "tanh",
    fn: lathe.tanh,
    params: [{ name: "gain", default: 1, min: 1, max: 10 }],
    tags: ["curve", "sigmoid"],
  },
  {
    name: "logistic",
    fn: lathe.logistic,
    params: [{ name: "gain", default: 2, min: 1, max: 10 }],
    tags: ["curve", "sigmoid"],
  },
  {
    name: "quadraticSlope",
    fn: lathe.quadraticSlope,
    features: { mirrorXY: true },
    params: [{ name: "bias", default: 1, min: 0, max: 1 }],
    y: "bias",
    tags: ["curve"],
  },
  {
    name: "quadraticBezier",
    fn: lathe.quadraticBezier,
    features: { mirrorXY: true },
    params: [
      { name: "x", default: 0.5, min: 0, max: 1 },
      { name: "y", default: 0.5, min: 0, max: 1 },
    ],
    x: "x",
    y: "y",
    tags: ["curve"],
  },
  {
    name: "cubicSlope",
    fn: lathe.cubicSlope,
    features: { mirrorXY: true },
    params: [
      { name: "bias", default: 1, min: 0, max: 1 },
      { name: "tension", default: 0.5, min: 0, max: 1 },
    ],
    y: "bias",
    tags: ["curve"],
  },
  {
    name: "pcurve",
    fn: lathe.pcurve,
    features: { mirrorXY: true },
    params: [
      { name: "a", default: 1, min: 0, max: 1 },
      { name: "b", default: 1, min: 0, max: 1 },
    ],
    tags: ["curve"],
    // y: "bias",
  },
  {
    name: "polyline",
    fn: lathe.polyline,
    params: [
      { name: "x", default: 0.5, min: 0, max: 1 },
      { name: "y", default: 0.3, min: 0, max: 1 },
    ],
    x: "x",
    y: "y",
    tags: ["curve", "vector"],
  },
  {
    name: "catmullClark",
    fn: lathe.catmullClark,
    features: { mirrorXY: true },
    params: [
      { name: "x₁", default: 0.25, min: 0, max: 1 },
      { name: "y₁", default: 0.75, min: 0, max: 1 },
      { name: "x₂", default: 0.75, min: 0, max: 1 },
      { name: "y₂", default: 0.25, min: 0, max: 1 },
      { name: "subdivisions", default: 3, min: 0, max: 6, step: 1 },
    ],
    x: "x₁",
    y: "y₁",
    tags: ["curve", "3d", "vector"],
  },
  {
    name: "linearStep",
    fn: lathe.linearStep,
    params: [
      { name: "x₁", default: 0.2, min: 0, max: 1 },
      { name: "x₂", default: 0.8, min: 0, max: 1 },
    ],
    tags: ["step"],
  },
  {
    name: "smoothStep",
    fn: lathe.smoothStep,
    params: [
      { name: "x₁", default: 0, min: 0, max: 1 },
      { name: "x₂", default: 1, min: 0, max: 1 },
    ],
    tags: ["step"],
  },
  {
    name: "smootherStep",
    fn: lathe.smootherStep,
    params: [
      { name: "edge0", default: 0, min: 0, max: 1 },
      { name: "edge1", default: 1, min: 0, max: 1 },
    ],
    tags: ["step"],
  },
  {
    name: "smoothestStep",
    fn: lathe.smoothestStep,
    params: [
      { name: "edge0", default: 0, min: 0, max: 1 },
      { name: "edge1", default: 1, min: 0, max: 1 },
    ],
    tags: ["step"],
  },
  {
    name: "doubleCubicSeat",
    fn: lathe.doubleCubicSeat,
    features: { mirrorXY: true },
    params: [
      { name: "x", default: 1, min: 0, max: 1 },
      { name: "y", default: 1, min: 0, max: 1 },
    ],
    x: "x",
    y: "y",
    tags: ["curve"],
  },
  {
    name: "doubleCubicSeatWithLinearBlend",
    fn: lathe.doubleCubicSeatWithLinearBlend,
    features: { mirrorXY: true },
    params: [
      { name: "x", default: 1, min: 0, max: 1 },
      { name: "y", default: 1, min: 0, max: 1 },
    ],
    x: "x",
    y: "y",
    tags: ["curve"],
  },
  {
    name: "doubleExponentialSigmoid",
    fn: lathe.doubleExponentialSigmoid,
    params: [{ name: "gain", default: 0, min: 0, max: 1 }],
    tags: ["curve"],
  },
  {
    name: "doubleExponentialSeat",
    fn: lathe.doubleExponentialSeat,
    params: [{ name: "gain", default: 0, min: 0, max: 1 }],
    tags: ["curve"],
  },
  {
    name: "quantize",
    fn: lathe.quantize,
    params: [
      {
        name: "step",
        default: 0.5,
        min: 0,
        max: 1,
        ticks: Array(4)
          .fill()
          .map((el, i) => lathe.quantize(1 / (i + 1), 0.001)),
      },
      {
        name: "algorithm",
        type: "radio",
        options: ["round", "ceil", "floor"],
        default: "round",
      },
    ],
    tags: ["utility"],
  },
  {
    name: "fold",
    fn: lathe.fold,
    features: { bidi: true },
    params: [
      {
        name: "gain",
        default: 1,
        min: 0,
        max: 9,
        ticks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
    ],
    tags: ["waveshaping", "dsp"],
  },
  {
    name: "sineFold",
    fn: lathe.sineFold,
    features: { bidi: true },
    params: [
      {
        name: "gain",
        default: 1,
        min: 0,
        max: 9,
        ticks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
    ],
    tags: ["waveshaping", "dsp"],
  },

  // ---------- DSP / saturation ----------
  {
    name: "softClipCubic",
    fn: lathe.softClipCubic,
    features: { bidi: true },
    params: [{ name: "gain", default: 1, min: 1, max: 10 }],
    tags: ["saturation", "dsp"],
  },
  {
    name: "algebraicSigmoid",
    fn: lathe.algebraicSigmoid,
    features: { bidi: true },
    params: [{ name: "gain", default: 2, min: 1, max: 10 }],
    tags: ["saturation", "dsp", "sigmoid"],
  },
  {
    name: "gudermannian",
    fn: lathe.gudermannian,
    features: { bidi: true },
    params: [{ name: "gain", default: 2, min: 1, max: 10 }],
    tags: ["saturation", "dsp", "sigmoid"],
  },
  {
    name: "reinhard",
    fn: lathe.reinhard,
    features: { bidi: true },
    params: [{ name: "gain", default: 2, min: 1, max: 10 }],
    tags: ["saturation", "dsp", "sigmoid"],
  },
  {
    name: "arctangentSigmoid",
    fn: lathe.arctangentSigmoid,
    features: { bidi: true },
    params: [{ name: "gain", default: 1, min: 0.1, max: 10 }],
    tags: ["saturation", "dsp", "sigmoid"],
  },
  {
    name: "softsign",
    fn: lathe.softsign,
    features: { bidi: true },
    params: [{ name: "gain", default: 1, min: 0.1, max: 10 }],
    tags: ["saturation", "dsp", "sigmoid"],
  },

  {
    name: "chebyshev",
    fn: lathe.chebyshev,
    features: { bidi: true, mirrorX: true },
    params: [
      {
        name: "order",
        default: 3,
        min: 2,
        max: 5,
        ticks: [2, 3, 4, 5],
      },
    ],
    tags: ["waveshaping", "dsp"],
  },
  {
    name: "halfWave",
    fn: lathe.halfWave,
    features: { bidi: true, mirrorXY: true },
    params: [{ name: "exponent", default: 5, min: 0.1, max: 10 }],
    tags: ["dsp"],
  },

  // ---------- Easings ----------
  {
    name: "easeElastic",
    fn: lathe.easeElastic,
    features: { mirrorXY: true },
    params: [
      { name: "amplitude", default: 1, min: 1, max: 4 },
      { name: "period", default: 0.3, min: 0.05, max: 1 },
    ],
    tags: ["easing"],
  },
  {
    name: "easeBounce",
    fn: lathe.easeBounce,
    features: { mirrorXY: true },
    params: [],
    tags: ["easing"],
  },
  {
    name: "easeBack",
    fn: lathe.easeBack,
    features: { mirrorXY: true },
    params: [{ name: "overshoot", default: 1.70158, min: 0, max: 5 }],
    tags: ["easing"],
  },
  {
    name: "easeExponential",
    fn: lathe.easeExponential,
    features: { mirrorXY: true },
    params: [{ name: "base", default: 2, min: 1.1, max: 100 }],
    tags: ["easing"],
  },

  // ---------- Bias / gain ----------
  {
    name: "schlick",
    fn: lathe.schlick,
    features: { mirrorXY: true },
    params: [{ name: "bias", default: 0.3, min: 0.001, max: 0.999 }],
    y: "bias",
    tags: ["bias", "curve"],
  },
  {
    name: "logit",
    fn: lathe.logit,
    features: { bidi: true },
    params: [{ name: "gain", default: 2, min: 0.5, max: 10 }],
    tags: ["bias", "curve"],
  },

  // ---------- Window / distribution ----------
  {
    name: "gaussian",
    fn: lathe.gaussian,
    params: [
      { name: "mean", default: 0.5, min: 0, max: 1 },
      { name: "sigma", default: 0.15, min: 0.01, max: 1 },
    ],
    x: "mean",
    tags: ["window"],
  },
  {
    name: "hann",
    fn: lathe.hann,
    x: "mean",
    params: [{
      name: "mean",
      default: 0.5,
      min: 0,
      max: 1,
    }],
    tags: ["window"],
  },
  {
    name: "tukey",
    fn: lathe.tukey,
    params: [{ name: "taper", default: 0.5, min: 0, max: 1 },
      {
        name: "mean",
        default: 0.5,
        min: 0,
        max: 1,
      }
    ],
    x: "mean",
    tags: ["window"],
  },
  {
    name: "hyperbolicCosine",
    fn: lathe.hyperbolicCosine,
    features: { bidi: true },
    params: [
      { name: "taper", default: 1, min: 0, max: 20 },
      { name: "mean", default: 0.5, min: 0, max: 1 },
    ],
    x: "mean",
    tags: ["window", "dsp"],
  },

  // ---------- Periodic ----------
  {
    name: "triangleWave",
    fn: lathe.triangleWave,
    params: [{ name: "phase", default: 0, min: 0, max: 1 }],
    tags: ["periodic"],
  },
  {
    name: "sawtoothWave",
    fn: lathe.sawtoothWave,
    params: [{ name: "phase", default: 0, min: 0, max: 1 }],
    tags: ["periodic"],
  },
  {
    name: "pulseWave",
    fn: lathe.pulseWave,
    params: [
      { name: "duty", default: 0.5, min: 0, max: 1 },
      { name: "phase", default: 0, min: 0, max: 1 },
    ],
    tags: ["periodic"],
  },
]
