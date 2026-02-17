const t = require("@babel/types");

function transformFunction(path) {
  if(path.isIdentifier()) {
    if (path.node.name === "fungsi") path.replaceWith(t.identifier("function"));
    if (path.node.name === "kembalikan") path.replaceWith(t.identifier("return"));
  }
}

module.exports = transformFunction;