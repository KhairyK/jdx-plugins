module.exports = function ({ types: t }) {
  return {
    visitor: {
      MemberExpression(path) {
        if (path.node.object.name === "konsol") {
          path.node.object = t.identifier("console");
        }

        const map = {
          log: "log",
          peringatan: "warn",
          error: "error",
          info: "info"
        };

        const propName = path.node.property.name;
        if (map[propName]) {
          path.node.property = t.identifier(map[propName]);
        }
      }
    }
  };
};