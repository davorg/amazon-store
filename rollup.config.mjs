// rollup.config.mjs
import replace from '@rollup/plugin-replace';

const banner = `/*! Amazon Store Router v${process.env.VERSION || '0.0.0'} — MIT */`;
const version = process.env.VERSION || '0.0.0';

export default [
  // ESM
  {
    input: 'src/amazon-store.esm.js',
    output: { file: 'dist/amazon-store.esm.js', format: 'esm', banner },
    plugins: [
      replace({
        preventAssignment: true,
        values: { __VERSION__: version }
      })
    ]
  },
  // UMD (global)
  {
    input: 'src/amazon-store.esm.js',
    output: { file: 'dist/amazon-store.js', format: 'umd', name: 'AmazonStore', banner },
    plugins: [
      replace({
        preventAssignment: true,
        values: { __VERSION__: version }
      })
    ]
  }
];

