// postcss-importを使えるようにする
module.exports = {
  plugins: [
    require('postcss-import')({
      path: ['src/assets/css']
    }),
  ]
}
