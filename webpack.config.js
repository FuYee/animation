/**
 * Created by yingfangzhao on 2017/9/22.
 */
module.exports = {
  entry:{
    animation: './src/animation.js'
  },
  output:{
    path: __dirname + '/build',
    filename: '[name].js',
    library: 'animation',
    libraryTarget: 'umd'
  }
}