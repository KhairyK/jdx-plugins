import * as t from "@babel/types";

export default function runtimeTypeOptimizedWithCache(opts = {}) {
  const options = Object.assign(
    {
      mode: "auto", // 'auto' | 'dev' | 'prod'
      stripInProduction: true,
      throwOnInvalid: true,
      helperPrefix: "__v",
    },
    opts
  );

  // safe process check (some bundlers may not have `process`)
  const isProd =
    options.mode === "prod" ||
    (options.mode === "auto" &&
      typeof process !== "undefined" &&
      process.env &&
      process.env.NODE_ENV === "production");

  // module scoped per Program
  let interfaceMap;
  let typeAliasMap;
  let validatorCache; // Map<key, Identifier>
  let helperStatements;
  let helperIndex;

  // utilities
  function mergeConditions(list) {
    if (!list || list.length === 0) return null;
    if (list.length === 1) return list[0];
    return list.slice(1).reduce((acc, cur) => t.logicalExpression("||", acc, cur), list[0]);
  }

  // stable serializer avoiding cycles
  function createTypeKey(typeNode) {
    const seen = new WeakMap();
    let counter = 0;
    try {
      return JSON.stringify(
        typeNode,
        function replacer(key, val) {
          if (val && typeof val === "object") {
            if (seen.has(val)) return `__cycle_${seen.get(val)}`;
            seen.set(val, ++counter);
          }
          if (key === "loc" || key === "start" || key === "end") return undefined;
          return val;
        }
      );
    } catch (e) {
      return `__unknown_type_${helperIndex++}`;
    }
  }

  function collectConditions(exprNode, typeNode, outArray) {
    if (!typeNode) return;

    // any / unknown => skip (cannot validate)
    if (t.isTSAnyKeyword(typeNode) || t.isTSUnknownKeyword(typeNode)) return;

    // primitives
    if (t.isTSNumberKeyword(typeNode)) {
      outArray.push(t.binaryExpression("!==", t.unaryExpression("typeof", exprNode), t.stringLiteral("number")));
      return;
    }
    if (t.isTSStringKeyword(typeNode)) {
      outArray.push(t.binaryExpression("!==", t.unaryExpression("typeof", exprNode), t.stringLiteral("string")));
      return;
    }
    if (t.isTSBooleanKeyword(typeNode)) {
      outArray.push(t.binaryExpression("!==", t.unaryExpression("typeof", exprNode), t.stringLiteral("boolean")));
      return;
    }

    // null / undefined
    if (t.isTSNullKeyword(typeNode)) {
      outArray.push(t.binaryExpression("!==", exprNode, t.nullLiteral()));
      return;
    }
    if (t.isTSUndefinedKeyword(typeNode)) {
      outArray.push(t.binaryExpression("!==", exprNode, t.identifier("undefined")));
      return;
    }

    // literal
    if (t.isTSLiteralType(typeNode)) {
      outArray.push(t.binaryExpression("!==", exprNode, typeNode.literal));
      return;
    }

    // array T[]
    if (t.isTSArrayType(typeNode)) {
      const elType = typeNode.elementType;
      // use Array.isArray(v)
      const notArray = t.unaryExpression(
        "!",
        t.callExpression(t.memberExpression(t.identifier("Array"), t.identifier("isArray")), [exprNode])
      );

      const elChecks = [];
      collectConditions(t.identifier("v"), elType, elChecks);

      if (elChecks.length === 0) {
        outArray.push(notArray);
        return;
      }

      const mergedEl = mergeConditions(elChecks) || t.booleanLiteral(false);
      const someCall = t.callExpression(t.memberExpression(exprNode, t.identifier("some")), [
        t.arrowFunctionExpression([t.identifier("v")], mergedEl),
      ]);
      outArray.push(t.logicalExpression("||", notArray, someCall));
      return;
    }

    // tuple types
    if (t.isTSTupleType && typeof t.isTSTupleType === "function" && t.isTSTupleType(typeNode)) {
      // naive tuple support: check Array.isArray && length && per-index checks
      const elems = typeNode.elementTypes || typeNode.types || [];
      const notArray = t.unaryExpression(
        "!",
        t.callExpression(t.memberExpression(t.identifier("Array"), t.identifier("isArray")), [exprNode])
      );
      const lengthMismatch = t.logicalExpression(
        "||",
        t.binaryExpression("!==", t.memberExpression(exprNode, t.identifier("length")), t.numericLiteral(elems.length)),
        t.booleanLiteral(false)
      );

      const indexChecks = [];
      elems.forEach((elType, idx) => {
        const idxExpr = t.memberExpression(exprNode, t.numericLiteral(idx), true);
        const inner = [];
        collectConditions(idxExpr, elType, inner);
        if (inner.length) indexChecks.push(inner[0]); // merge later if needed
      });

      // build combined check
      const checks = [];
      checks.push(notArray);
      if (indexChecks.length) {
        const mergedIndex = indexChecks.length === 1 ? indexChecks[0] : indexChecks.slice(1).reduce((a, b) => t.logicalExpression("||", a, b), indexChecks[0]);
        checks.push(mergedIndex);
      } else {
        checks.push(lengthMismatch);
      }
      outArray.push(mergeConditions(checks));
      return;
    }

    // object shape
    if (t.isTSTypeLiteral(typeNode)) {
      // base object invalid: typeof !== 'object' || v === null
      outArray.push(
        t.logicalExpression(
          "||",
          t.binaryExpression("!==", t.unaryExpression("typeof", exprNode), t.stringLiteral("object")),
          t.binaryExpression("===", exprNode, t.nullLiteral())
        )
      );

      for (const member of typeNode.members) {
        if (!t.isTSPropertySignature(member)) continue;

        let keyName = null;
        let computed = false;
        if (t.isIdentifier(member.key)) {
          keyName = member.key.name;
        } else if (t.isStringLiteral(member.key) || t.isNumericLiteral(member.key)) {
          keyName = member.key.value;
          computed = true;
        } else continue;

        const propExpr = t.memberExpression(
          exprNode,
          computed ? (typeof keyName === "number" ? t.numericLiteral(keyName) : t.stringLiteral(keyName)) : t.identifier(keyName),
          computed
        );

        const propInner = [];
        const propType = member.typeAnnotation && member.typeAnnotation.typeAnnotation;
        if (!propType) {
          if (!member.optional) outArray.push(t.binaryExpression("===", propExpr, t.identifier("undefined")));
          continue;
        }

        collectConditions(propExpr, propType, propInner);
        if (propInner.length === 0) {
          if (!member.optional) outArray.push(t.binaryExpression("===", propExpr, t.identifier("undefined")));
          continue;
        }

        const mergedInner = mergeConditions(propInner);

        if (member.optional) {
          outArray.push(t.logicalExpression("&&", t.binaryExpression("!==", propExpr, t.identifier("undefined")), mergedInner));
        } else {
          outArray.push(t.logicalExpression("||", t.binaryExpression("===", propExpr, t.identifier("undefined")), mergedInner));
        }
      }
      return;
    }

    // TSTypeReference -> resolve from registries
    if (t.isTSTypeReference(typeNode) && t.isIdentifier(typeNode.typeName)) {
      const refName = typeNode.typeName.name;
      const ref = interfaceMap.get(refName) || typeAliasMap.get(refName);
      if (ref) collectConditions(exprNode, ref, outArray);
      return;
    }

    // union -> invalid if ALL branches invalid (branch1 && branch2 && ...)
    if (t.isTSUnionType(typeNode)) {
      const branchInvalids = [];
      for (const sub of typeNode.types) {
        const tmp = [];
        collectConditions(exprNode, sub, tmp);
        const merged = mergeConditions(tmp) || t.booleanLiteral(false); // if sub has no checks => always valid => merged=false
        branchInvalids.push(merged);
      }
      if (branchInvalids.length === 1) {
        outArray.push(branchInvalids[0]);
      } else {
        const allInvalid = branchInvalids.slice(1).reduce((a, b) => t.logicalExpression("&&", a, b), branchInvalids[0]);
        outArray.push(allInvalid);
      }
      return;
    }

    // fallback: skip
    return;
  }

  // generate per-validator WeakMap name (safe identifier)
  function makeCacheIdForHelper(helperId) {
    // helperId is an Identifier; compose a new Identifier name
    return t.identifier(`__cache_${helperId.name}`);
  }

  function getValidatorId(typeNode, preferredName = null) {
    const key = createTypeKey(typeNode);
    if (validatorCache.has(key)) return validatorCache.get(key);

    let baseName = typeof preferredName === "string" ? preferredName : null;
    if (!baseName && t.isTSTypeReference(typeNode) && t.isIdentifier(typeNode.typeName)) baseName = typeNode.typeName.name;

    let idName = baseName ? `${options.helperPrefix}_${baseName}` : `${options.helperPrefix}_${helperIndex++}`;
    // ensure uniqueness
    while ([...validatorCache.values()].some((id) => id.name === idName)) idName = `${idName}_${helperIndex++}`;

    const id = t.identifier(idName);

    // If stripping in production, produce a noop validator
    if (options.stripInProduction && isProd) {
      const decl = t.variableDeclaration("const", [
        t.variableDeclarator(id, t.arrowFunctionExpression([t.identifier("v")], t.booleanLiteral(false))),
      ]);
      helperStatements.push(decl);
      validatorCache.set(key, id);
      return id;
    }

    // produce real validator with per-validator WeakMap
    const param = t.identifier("v");
    const conds = [];
    collectConditions(param, typeNode, conds);
    const bodyExpr = mergeConditions(conds) || t.booleanLiteral(false);

    // per-validator cache
    const cacheId = makeCacheIdForHelper(id);
    const cacheDecl = t.variableDeclaration("const", [t.variableDeclarator(cacheId, t.newExpression(t.identifier("WeakMap"), []))]);

    // build function body:
    // if (typeof v === 'object' && v !== null) { const __cached = __cache_<id>.get(v); if (__cached !== undefined) return __cached; }
    // const __invalid = (<bodyExpr>);
    // if (typeof v === 'object' && v !== null) __cache_<id>.set(v, __invalid);
    // return __invalid;

    const typeofObject = t.logicalExpression("&&", t.binaryExpression("===", t.unaryExpression("typeof", param), t.stringLiteral("object")), t.binaryExpression("!==", param, t.nullLiteral()));

    const getCached = t.variableDeclaration("const", [
      t.variableDeclarator(t.identifier("__cached"), t.callExpression(t.memberExpression(cacheId, t.identifier("get")), [param])),
    ]);
    const ifReturnCached = t.ifStatement(t.binaryExpression("!==", t.identifier("__cached"), t.identifier("undefined")), t.blockStatement([t.returnStatement(t.identifier("__cached"))]));

    const invalidDecl = t.variableDeclaration("const", [t.variableDeclarator(t.identifier("__invalid"), bodyExpr)]);
    const setCached = t.ifStatement(
      typeofObject,
      t.blockStatement([t.expressionStatement(t.callExpression(t.memberExpression(cacheId, t.identifier("set")), [param, t.identifier("__invalid")]))])
    );

    const funcBody = t.blockStatement([
      t.ifStatement(typeofObject, t.blockStatement([getCached, ifReturnCached])),
      invalidDecl,
      setCached,
      t.returnStatement(t.identifier("__invalid")),
    ]);

    const funcDecl = t.variableDeclaration("const", [t.variableDeclarator(id, t.arrowFunctionExpression([param], funcBody))]);

    // push cache decl BEFORE function so cache exists
    helperStatements.push(cacheDecl, funcDecl);
    validatorCache.set(key, id);
    return id;
  }

  function buildIfForParam(paramExpr, typeNode, optional = false, paramNameForMessage = "param", funcName = null) {
    if (!typeNode) return null;

    if (options.stripInProduction && isProd) return null; // skip when stripping

    const helperId = getValidatorId(typeNode);
    const call = t.callExpression(helperId, [paramExpr]);

    let finalCond;
    if (optional) {
      finalCond = t.logicalExpression("&&", t.binaryExpression("!==", paramExpr, t.identifier("undefined")), call);
    } else {
      finalCond = t.logicalExpression("||", t.binaryExpression("===", paramExpr, t.identifier("undefined")), call);
    }

    const nameForMsg = funcName ? `${funcName}.${paramNameForMessage}` : paramNameForMessage;
    const throwStmt = options.throwOnInvalid
      ? t.throwStatement(t.newExpression(t.identifier("TypeError"), [t.stringLiteral(`${nameForMsg} has invalid type`)]))
      : t.returnStatement(t.newExpression(t.identifier("Error"), [t.stringLiteral(`${nameForMsg} has invalid type`)]));

    return t.ifStatement(finalCond, t.blockStatement([throwStmt]));
  }

  function resolveFunctionName(path) {
    const node = path.node;
    if (t.isFunctionDeclaration(node) && node.id) return node.id.name;
    if (t.isFunctionExpression(node) && node.id) return node.id.name;
    const parent = path.parentPath;
    if (parent && parent.isVariableDeclarator() && t.isIdentifier(parent.node.id)) return parent.node.id.name;
    if (parent && parent.isAssignmentExpression() && t.isIdentifier(parent.node.left)) return parent.node.left.name;
    // methods handled elsewhere by processFunction through parent context if needed
    return null;
  }

  function processFunction(path) {
    const checks = [];
    const params = path.node.params;
    const funcName = resolveFunctionName(path);

    for (const param of params) {
      if (t.isIdentifier(param)) {
        if (param.typeAnnotation) {
          const typeNode = param.typeAnnotation.typeAnnotation;
          const stmt = buildIfForParam(t.identifier(param.name), typeNode, !!param.optional, param.name, funcName);
          if (stmt) checks.push(stmt);
          param.typeAnnotation = null;
        }
        continue;
      }

      if (t.isAssignmentPattern(param) && t.isIdentifier(param.left)) {
        if (param.left.typeAnnotation) {
          const typeNode = param.left.typeAnnotation.typeAnnotation;
          const stmt = buildIfForParam(t.identifier(param.left.name), typeNode, true, param.left.name, funcName);
          if (stmt) checks.push(stmt);
          param.left.typeAnnotation = null;
        }
        continue;
      }

      if (t.isRestElement(param) && t.isIdentifier(param.argument)) {
        if (param.argument.typeAnnotation) {
          const typeNode = param.argument.typeAnnotation.typeAnnotation;
          const stmt = buildIfForParam(t.identifier(param.argument.name), typeNode, false, param.argument.name, funcName);
          if (stmt) checks.push(stmt);
          param.argument.typeAnnotation = null;
        }
        continue;
      }

      // other complex patterns skipped
    }

    if (checks.length && path.node.body && Array.isArray(path.node.body.body)) {
      path.node.body.body.unshift(...checks);
    }

    if (path.node.returnType) path.node.returnType = null;
  }

  return {
    visitor: {
      Program: {
        enter() {
          interfaceMap = new Map();
          typeAliasMap = new Map();
          validatorCache = new Map();
          helperStatements = [];
          helperIndex = 0;
        },
        exit(path) {
          if (!helperStatements.length) return;

          // Insert helpers after directives & import declarations to preserve ordering
          const body = path.node.body;
          let insertAt = body.findIndex((node) => !(t.isDirective(node) || t.isImportDeclaration(node)));
          if (insertAt === -1) insertAt = body.length;
          path.node.body = [...body.slice(0, insertAt), ...helperStatements, ...body.slice(insertAt)];
        },
      },

      // collect interface declarations
      TSInterfaceDeclaration(path) {
        const name = path.node.id.name;
        const literal = t.tsTypeLiteral(path.node.body.body.slice());
        interfaceMap.set(name, literal);
        // remove declaration so TS syntax doesn't remain
        path.remove();
      },

      // collect type aliases
      TSTypeAliasDeclaration(path) {
        const name = path.node.id.name;
        const typeNode = path.node.typeAnnotation;
        if (typeNode) typeAliasMap.set(name, typeNode);
        path.remove();
      },

      FunctionDeclaration(path) {
        processFunction(path);
      },

      FunctionExpression(path) {
        processFunction(path);
      },

      ArrowFunctionExpression(path) {
        if (!t.isBlockStatement(path.node.body)) path.node.body = t.blockStatement([t.returnStatement(path.node.body)]);
        processFunction(path);
      },

      ClassMethod(path) {
        processFunction(path);
      },

      ObjectMethod(path) {
        processFunction(path);
      },

      // keep imports; plugin doesn't attempt to resolve external TS types at build-time
      ImportDeclaration() {},
    },
  };
}
