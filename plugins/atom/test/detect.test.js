import { detectAMD } from './src/core/detectAMD.js';

const code = `
define(["a","b"], function(a,b){
  return { hi: () => "hello" };
});
`;

console.log(detectAMD(code));
