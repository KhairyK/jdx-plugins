import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import esbuild from 'rollup-plugin-esbuild';

export default [
  // Build normal (non-minified)
  {
    input: 'src/index.js',
    plugins: [
      resolve(),
      commonjs()
    ],
    output: [
      {
        file: 'dist/stringfyr.cjs.js',
        format: 'cjs',
        exports: 'named',
        sourcemap: true
      },
      {
        file: 'dist/stringfyr.esm.js',
        format: 'esm',
        sourcemap: true
      },
      {
        file: 'dist/stringfyr.umd.js',
        format: 'umd',
        name: 'Stringfyr',
        sourcemap: true
      },
      {
        file: 'dist/stringfyr.amd.js',
        format: 'amd',
        name: 'Stringfyr',
        sourcemap: true
      }
    ]
  },

  // Build minified (browser only)
  {
    input: 'src/index.js',
    plugins: [
      resolve(),
      commonjs(),
      esbuild({ minify: true })
    ],
    output: {
      file: 'dist/stringfyr.umd.min.js',
      format: 'umd',
      name: 'Stringfyr',
      sourcemap: true
    }
  }
];
