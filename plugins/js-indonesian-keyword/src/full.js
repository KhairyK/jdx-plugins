const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;

const transformIfElse = require("./if");
const transformLoop = require("./loop");
const transformFunc = require("./func");
const transformConsole = require("./console");

function parseIndonesia(code) {
  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["jsx"]
  });
  
  traverse(ast, {
    Identifier(path) {
      transformIfElse(path);
      transformLoop(path);
      transformFunc(path);
    },
    MemberExpression(path) {
      transformConsole(path);
    }
  });
  
  return generator(ast).code;
}

module.exports = parseIndonesia;