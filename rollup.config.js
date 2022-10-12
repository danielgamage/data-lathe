import typescript from '@rollup/plugin-typescript';

const config = {
  plugins: [typescript({
    exclude: ["docs/**/*", "node_modules/**/*", "test/**/*"],
  })],
  input: "src/index.ts",
  output: {
    dir: "./",
    format: "esm",
    compact: true,
  },
};

export default config;
