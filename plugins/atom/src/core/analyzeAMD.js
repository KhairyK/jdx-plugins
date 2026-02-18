import { parse } from 'acorn';
import { simple as walk } from 'acorn-walk';

export function analyzeAMD(code) {
  const results = [];

  const ast = parse(code, {
    ecmaVersion: 'latest',
    sourceType: 'script',
  });

  walk(ast, {
    CallExpression(node) {
      if (node.callee.type !== 'Identifier') return;

      const name = node.callee.name;
      if (name !== 'define' && name !== 'require') return;

      const info = {
        type: name,
        name: null,
        deps: [],
        params: [],
        hasFactory: false,
        hasReturn: false,
        node,
      };

      let args = node.arguments;

      // Pattern: define("name", [...], fn)
      if (args[0]?.type === 'Literal' && typeof args[0].value === 'string') {
        info.name = args[0].value;
        args = args.slice(1);
      }

      // Dependencies array
      if (args[0]?.type === 'ArrayExpression') {
        info.deps = args[0].elements.map((el) => el.value);
        args = args.slice(1);
      }

      // Factory function
      const factory = args[0];

      if (
        factory?.type === 'FunctionExpression' ||
        factory?.type === 'ArrowFunctionExpression'
      ) {
        info.hasFactory = true;

        info.params = factory.params.map((p) => p.name);

        // Detect return statement
        walk(factory.body, {
          ReturnStatement() {
            info.hasReturn = true;
          },
        });
      }

      results.push(info);
    },
  });

  return results;
}
