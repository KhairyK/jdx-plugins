module.exports = function ({ types: t }) {
  return {
    visitor: {
      Identifier(path) {
        if (path.node.name === "jika") {
          path.replaceWith(t.identifier("if"));
        }
        if (path.node.name === "selain") {
          path.replaceWith(t.identifier("else"));
        }
      }
    }
  };
};