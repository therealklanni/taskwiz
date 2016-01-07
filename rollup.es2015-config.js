import babel from 'rollup-plugin-babel'

export default {
  entry: 'index.js',
  dest: 'dist/taskwiz.es2015.js',
  plugins: [ babel() ],
  sourceMap: 'inline',
  format: 'es6'
}
