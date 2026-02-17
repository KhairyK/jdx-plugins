const t = require("@babel/types");

function transformIfElse(path) {
  if(path.isIdentifier()) {
    if (path.node.name === "jika") path.replaceWith(t.identifier("if"));
    if (path.node.name === "selain") path.replaceWith(t.identifier("else"));
  }
}

module.exports = transformIfElse;