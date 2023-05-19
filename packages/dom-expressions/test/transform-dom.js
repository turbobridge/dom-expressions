const babelJest = require("babel-jest");

module.exports = babelJest.createTransformer({
  presets: [["@babel/preset-env", { targets: { node: "current" } }]],
  plugins: [
    ["babel-plugin-jsx-dom-expressions",
     {
       moduleName: "../../src/client",

       delegateEvents: false,
       effectWrapper: false,
       memoWrapper: false,
       wrapConditionals: false,
     }]
  ]
});
