// rollup.config.mjs
import replace from '@rollup/plugin-replace';
import banner2 from 'rollup-plugin-banner2';
import makeBanner from './build/banner.js';

const banner = () => makeBanner({
  repo: 'https://github.com/YOURUSER/amazon_store'
});

export default [
  // ESM
  {
    input: 'src/amazon-store.esm.js',
    output: { file: 'dist/amazon-store.esm.js', format: 'esm', banner: banner() },
    plugins: [
      replace({ preventAssignment: true, __VERSION__: process.env.VERSION || '0.0.0' }),
      banner2(() => banner()) // keeps it if output.banner is not supported by some plugins
    ]
  },
  // UMD
  {
    input: 'src/amazon-store.esm.js',
    output: { file: 'dist/amazon-store.js', format: 'umd', name: 'AmazonStore', banner: banner() },
    plugins: [
      replace({ preventAssignment: true, __VERSION__: process.env.VERSION || '0.0.0' }),
      banner2(() => banner())
    ]
  }
];

