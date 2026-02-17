const t = require("@babel/types");

function transformConsole(path) {
  if(path.isMemberExpression() && path.node.object.name === "konsol") {
    path.node.object = t.identifier("console");
    const map = { log:"log", peringatan:"warn", error:"error", info:"info" };
    const prop = path.node.property.name;
    if(map[prop]) path.node.property = t.identifier(map[prop]);
  }
}

module.exports = transformConsole;