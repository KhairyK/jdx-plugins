module.exports = function ({ types: t }) {
  return {
    visitor: {
      Identifier(path) {
        if (path.node.name === "jika") path.replaceWith(t.identifier("if"));
        if (path.node.name === "selain") path.replaceWith(t.identifier("else"));
        if (path.node.name === "ulang") path.replaceWith(t.identifier("for"));
        if (path.node.name === "selama") path.replaceWith(t.identifier("while"));
      },
      MemberExpression(path) {
        if (path.node.object.name === "konsol") {
          path.node.object = t.identifier("console");
        }
        const map = { log: "log", peringatan: "warn", error: "error", info: "info" };
        const propName = path.node.property.name;
        if (map[propName]) path.node.property = t.identifier(map[propName]);
      }
    }
  };
};