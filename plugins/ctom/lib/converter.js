import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";

export function convert(code) {
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["jsx"]
  });

  traverse(ast, {
    VariableDeclaration(path) {
      const decl = path.node.declarations[0];
      if (!decl || !decl.init) return;

      const init = decl.init;

      // require("x")
      if (
        t.isCallExpression(init) &&
        t.isIdentifier(init.callee, { name: "require" }) &&
        t.isStringLiteral(init.arguments[0])
      ) {
        const moduleName = init.arguments[0].value;

        // const fs = require("fs")
        if (t.isIdentifier(decl.id)) {
          const importDecl = t.importDeclaration(
            [t.importDefaultSpecifier(decl.id)],
            t.stringLiteral(moduleName)
          );
          path.replaceWith(importDecl);
        }

        // const { readFile } = require("fs")
        if (t.isObjectPattern(decl.id)) {
          const specifiers = decl.id.properties.map(prop =>
            t.importSpecifier(prop.value, prop.key)
          );

          const importDecl = t.importDeclaration(
            specifiers,
            t.stringLiteral(moduleName)
          );

          path.replaceWith(importDecl);
        }
      }
    },

    AssignmentExpression(path) {
      const node = path.node;

      // module.exports
      if (
        t.isMemberExpression(node.left) &&
        node.left.object.name === "module" &&
        node.left.property.name === "exports"
      ) {
        path.replaceWith(
          t.exportDefaultDeclaration(node.right)
        );
      }

      // exports.foo
      if (
        t.isMemberExpression(node.left) &&
        node.left.object.name === "exports"
      ) {
        const name = node.left.property.name;

        path.replaceWith(
          t.exportNamedDeclaration(
            t.variableDeclaration("const", [
              t.variableDeclarator(t.identifier(name), node.right)
            ])
          )
        );
      }
    }
  });

  return generate(ast, { retainLines: true }).code;
}