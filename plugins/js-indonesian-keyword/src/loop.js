module.exports = function ({ types: t }) {
  return {
    visitor: {
      Identifier(path) {
        if (path.node.name === "ulang") {
          path.replaceWith(t.identifier("for"));
        }
        if (path.node.name === "selama") {
          path.replaceWith(t.identifier("while"));
        }
      }
    }
  };
};