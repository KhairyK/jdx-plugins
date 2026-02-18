import { analyzeAMD } from '../src/core/analyzeAMD.js';

const code = `
define("mod", ["a","b"], function(a,b){
  function hi(){}
  return { hi };
});
`;

console.log(analyzeAMD(code));
