module.exports = {
  presets: [["@babel/preset-env", { targets: { node: "current" } }]],
  plugins: [
    ["babel-plugin-jsx-dom-expressions",
     {
       moduleName: "./custom",

       delegateEvents: false,
       effectWrapper: false,
       memoWrapper: false,
       wrapConditionals: false,
     }
    ]
  ]
};
