import babel from 'rollup-plugin-babel'

export default {
  entry: 'index.js',
  dest: 'dist/taskwiz.js',
  plugins: [ babel() ],
  sourceMap: 'inline',
  format: 'cjs'
}
