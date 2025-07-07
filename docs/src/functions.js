import * as lathe from "data-lathe";

export const functions = [
  {
    name: "uniToBi",
    fn: lathe.uniToBi,
    features: { bidi: true },
  },
  {
    name: "biToUni",
    fn: lathe.biToUni,
    features: { bidi: true },
  },
  {
    name: "clamp",
    fn: lathe.clamp,
    params: [
      { name: "min", default: 0.25, min: -1, max: 1 },
      { name: "max", default: 0.75, min: -1, max: 1 },
    ]
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
  },
  {
    name: "ease",
    fn: lathe.ease,
    features: { mirrorXY: true },
    params: [
      { name: "order", default: 3, min: -6, max: 6 },
    ],
  },
  {
    name: "circularArc",
    fn: lathe.circularArc,
    features: { mirrorXY: true },
    params: [{ name: "bias", default: 1, min: 0, max: 1 }],
    y: "bias",
  },
  {
    name: "tanh",
    fn: lathe.tanh,
    params: [{ name: "gain", default: 1, min: 1, max: 10 }],
  },
  {
    name: "logistic",
    fn: lathe.logistic,
    params: [{ name: "gain", default: 2, min: 1, max: 10 }],
  },
  // {
  //   name: "generalizedLogistic",
  //   fn: lathe.generalizedLogistic,
  //   params: [
  //     { name: "A", default: 0, min: 0, max: 1 },
  //     { name: "K", default: 1, min: 0, max: 1 },
  //     { name: "C", default: 1, min: 0, max: 1 },
  //     { name: "Q", default: 4, min: 1, max: 10 },
  //     { name: "B", default: 4, min: 0, max: 10 },
  //     { name: "v", default: 1, min: 0, max: 10 },
  //   ],
  // },
  {
    name: "quadraticSlope",
    fn: lathe.quadraticSlope,
    features: { mirrorXY: true },
    params: [{ name: "bias", default: 1, min: 0, max: 1 }],
    y: "bias",
  },
  {
    name: "quadraticBezier",
    fn: lathe.quadraticBezier,
    features: { mirrorXY: true },
    params: [
      { name: "x", default: 0.5, min: 0, max: 1 },
      { name: "y", default: 0.5, min: 0, max: 1 }
    ],
    x: "x",
    y: "y",
  },
    {
    name: "cubicSlope",
    fn: lathe.cubicSlope,
    features: { mirrorXY: true },
    params: [
      { name: "bias", default: 1, min: 0, max: 1 },
      { name: "tension", default: 0.5, min: 0, max: 1 }],
    y: "bias",
  },
  {
    name: "pcurve",
    fn: lathe.pcurve,
    features: { mirrorXY: true },
    params: [
      { name: "a", default: 1, min: 0, max: 1 },
      { name: "b", default: 1, min: 0, max: 1 }
    ],
    // y: "bias",
  },
  {
    name: "doubleCubicSeat",
    fn: lathe.doubleCubicSeat,
    features: { mirrorXY: true },
    params: [
      { name: "x", default: 1, min: 0, max: 1 },
      { name: "y", default: 1, min: 0, max: 1 }
    ],
    x: "x",
    y: "y",
  },
  {
    name: "doubleCubicSeatWithLinearBlend",
    fn: lathe.doubleCubicSeatWithLinearBlend,
    features: { mirrorXY: true },
    params: [
      { name: "x", default: 1, min: 0, max: 1 },
      { name: "y", default: 1, min: 0, max: 1 }
    ],
    x: "x",
    y: "y",
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
  },
  {
    name: "linearStep",
    fn: lathe.linearStep,
    params: [
      { name: "x₁", default: 0.2, min: 0, max: 1 },
      { name: "x₂", default: 0.8, min: 0, max: 1 },
    ],
  },
  {
    name: "smoothStep",
    fn: lathe.smoothStep,
    params: [
      { name: "x₁", default: 0, min: 0, max: 1 },
      { name: "x₂", default: 1, min: 0, max: 1 },
    ],
  },
  {
    name: "doubleExponentialSigmoid",
    fn: lathe.doubleExponentialSigmoid,
    params: [{ name: "gain", default: 0, min: 0, max: 1 }],
  },
  {
    name: "doubleExponentialSeat",
    fn: lathe.doubleExponentialSeat,
    params: [{ name: "gain", default: 0, min: 0, max: 1 }],
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
      }
    ],
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
  },
];
