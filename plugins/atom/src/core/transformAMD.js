import MagicString from 'magic-string';
import { analyzeAMD } from './analyzeAMD.js';

/**
 * Transform AMD → ESM
 * @param {string} code
 * @returns {string}
 */
export function transformAMD(code) {
  const analysis = analyzeAMD(code);

  if (!analysis.length) return code;

  const ms = new MagicString(code);

  for (const item of analysis) {
    const { deps, params, node } = item;

    // 🔹 Generate import statements
    let imports = '';

    deps.forEach((dep, i) => {
      const param = params[i] || `dep${i}`;
      imports += `import ${param} from "${dep}";\n`;
    });

    // 🔹 Extract factory body
    const factory = node.arguments.find(
      (arg) =>
        arg.type === 'FunctionExpression' ||
        arg.type === 'ArrowFunctionExpression'
    );

    if (!factory) continue;

    const bodyStart = factory.body.start + 1;
    const bodyEnd = factory.body.end - 1;

    let bodyCode = code.slice(bodyStart, bodyEnd);

    // 🔹 Extract return statement
    let exportCode = '';

    const returnMatch = bodyCode.match(/return\s+({[\s\S]*?});?/);

    if (returnMatch) {
      const obj = returnMatch[1];

      const names = obj
        .replace(/[{}]/g, '')
        .split(',')
        .map((s) => s.split(':')[0].trim())
        .filter(Boolean);

      exportCode = `\nexport { ${names.join(', ')} };`;

      bodyCode = bodyCode.replace(returnMatch[0], '');
    }

    // 🔹 Replace entire define() call
    const replacement = `${imports}\n${bodyCode.trim()}${exportCode}\n`;

    ms.overwrite(node.start, node.end, replacement);
  }

  return ms.toString();
}
