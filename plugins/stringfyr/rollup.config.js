import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/stringfyr.cjs.js',
      format: 'cjs',
      exports: 'named'
    },
    {
      file: 'dist/stringfyr.esm.js',
      format: 'esm'
    },
    {
      file: 'dist/stringfyr.umd.js',
      format: 'umd',
      name: 'stringfyr'
    },
    {
      file: 'dist/stringfyr.amd.js',
      format: 'amd',
      name: 'stringfyr'
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
    terser() // minify
  ]
};