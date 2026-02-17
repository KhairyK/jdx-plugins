const t = require("@babel/types");

function transformLoop(path) {
  if(path.isIdentifier()) {
    if (path.node.name === "ulang") path.replaceWith(t.identifier("for"));
    if (path.node.name === "selama") path.replaceWith(t.identifier("while"));
  }
}

module.exports = transformLoop;