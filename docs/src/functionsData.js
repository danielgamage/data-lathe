import {
  tanh,
  doubleExponentialSigmoid,
  quadraticSlope,
  circularArc,
  ease,
  quantize,
  fold,
  sineFold,
  uniToBi,
  biToUni,
  logistic,
  smoothStep,
  // generalizedLogistic,
  linearStep,
  polyline,
  doubleExponentialSeat
} from "./functions.ts";

export const functions = [
  {
    name: "uniToBi",
    fn: uniToBi,
    features: { bidi: true },
  },
  {
    name: "biToUni",
    fn: biToUni,
    features: { bidi: true },
  },
  {
    name: "ease",
    fn: ease,
    features: { mirrorXY: true },
    params: [
      { name: "order", default: 3, min: -6, max: 6 },
    ],
  },
  {
    name: "circularArc",
    fn: circularArc,
    features: { mirrorXY: true },
    params: [{ name: "bias", default: 1, min: 0, max: 1 }],
    y: "bias",
  },
  {
    name: "tanh",
    fn: tanh,
    params: [{ name: "gain", default: 1, min: 1, max: 10 }],
  },
  {
    name: "logistic",
    fn: logistic,
    params: [{ name: "gain", default: 2, min: 1, max: 10 }],
  },
  // {
  //   name: "generalizedLogistic",
  //   fn: generalizedLogistic,
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
    fn: quadraticSlope,
    features: { mirrorXY: true },
    params: [{ name: "bias", default: 1, min: 0, max: 1 }],
    y: "bias",
  },
  {
    name: "polyline",
    fn: polyline,
    params: [
      { name: "x", default: 0.5, min: 0, max: 1 },
      { name: "y", default: 0.3, min: 0, max: 1 },
    ],
    x: "x",
    y: "y",
  },
  {
    name: "linearStep",
    fn: linearStep,
    params: [
      { name: "x₁", default: 0.2, min: 0, max: 1 },
      { name: "x₂", default: 0.8, min: 0, max: 1 },
    ],
  },
  {
    name: "smoothStep",
    fn: smoothStep,
    params: [
      { name: "x₁", default: 0, min: 0, max: 1 },
      { name: "x₂", default: 1, min: 0, max: 1 },
    ],
  },
  {
    name: "doubleExponentialSigmoid",
    fn: doubleExponentialSigmoid,
    params: [{ name: "gain", default: 0, min: 0, max: 1 }],
  },
  {
    name: "doubleExponentialSeat",
    fn: doubleExponentialSeat,
    params: [{ name: "gain", default: 0, min: 0, max: 1 }],
  },
  {
    name: "quantize",
    fn: quantize,
    params: [
      {
        name: "step",
        default: 0.5,
        min: 0,
        max: 1,
        ticks: Array(4)
          .fill()
          .map((el, i) => quantize(1 / (i + 1), 0.001)),
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
    fn: fold,
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
    fn: sineFold,
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
