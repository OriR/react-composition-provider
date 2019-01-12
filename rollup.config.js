import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import commonjs from 'rollup-plugin-commonjs'
import clear from 'rollup-plugin-clear'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

const env = process.env.NODE_ENV
const isProduction = env === 'production';
const basicConfig = {
  external: Object.keys(pkg.peerDependencies || {}),
  output: {
    globals: {
      react: 'React'
    }
  },
  plugins: [
    clear({
      targets: ['./es', './dist']
    }),
    nodeResolve(),
    commonjs({
      include: "node_modules/**"
    }),
    babel({
      exclude: '**/node_modules/**',
      runtimeHelpers: true
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env)
    }),
    isProduction && terser({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false
      }
    })
  ].filter(Boolean)
};

const config = [{
  ...basicConfig,
  input: {
    'index': 'src/index.js',
    'composers': 'src/composers.js'
  },
  output: {
    ...basicConfig.output,
    format: 'esm',
    dir: 'es'
  }
}, {
  ...basicConfig,
  input: 'src/index.js',
  output: {
    ...basicConfig.output,
    format: 'umd',
    file: pkg.main,
    name: 'ReactCompositionProvider'
  }
}];

export default config
