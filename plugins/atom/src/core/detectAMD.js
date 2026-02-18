import { parse } from "acorn";
import { simple as walk } from "acorn-walk";

/**
 * Detect AMD usage in source code
 * @param {string} code
 * @returns {object}
 */
export function detectAMD(code) {
    const result = {
        isAMD: false,
        hasDefine: false,
        hasRequire: false,
        nodes: []
    };
    
    const ast = parse(code, {
        ecmaVersion: "latest",
        sourceType: "script"
    });
    
    walk(ast, {
        CallExpression(node) {
            if (node.callee.type !== "Identifier") return;
            
            const name = node.callee.name;
            
            if (name === "define") {
                result.isAMD = true;
                result.hasDefine = true;
                result.nodes.push(node);
            }
            
            if (name === "require") {
                result.isAMD = true;
                result.hasRequire = true;
                result.nodes.push(node);
            }
        }
    });
    
    return result;
}