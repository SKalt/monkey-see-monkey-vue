import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import vueSFC from "rollup-plugin-vue";
import pkg from "./package.json";
const name = "monkey-see-monkey-vue";
// import process from "process";
const plugins = [
  resolve(),
  commonjs(),
  vueSFC({
    css: true, // Dynamically inject css as a <style> tag
    compileTemplate: true // Explicitly convert template to render function
  })
];

export default [
  // browser-friendly UMD build
  {
    input: "src/index.js",
    output: [
      { name, file: pkg.browser, format: "umd" },
      { name, file: pkg.main, format: "cjs" },
      { name, file: pkg.module, format: "es" }
    ],
    plugins
  }
];
