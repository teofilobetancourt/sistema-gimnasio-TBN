'use strict'
// Template version: 1.3.1
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require('path')

module.exports = {
  dev: {
    // Paths
    assetsSubDirectory: 'static',
    assetsPublicPath: '/', // ✅ Rutas absolutas en desarrollo
    proxyTable: {},

    // Dev Server settings
    host: 'localhost',
    port: 8080,
    autoOpenBrowser: false,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false,

    // Source Maps
    devtool: 'cheap-module-eval-source-map',
    cacheBusting: true,
    cssSourceMap: true
  },

  build: {
    // Template for index.html
    index: path.resolve(__dirname, '../dist/index.html'),

    // Output paths
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: './', // ✅ Rutas relativas en producción para que funcione desde subcarpetas

    // Source Maps
    productionSourceMap: true,
    devtool: '#source-map',

    // Gzip
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],

    // Report
    bundleAnalyzerReport: process.env.npm_config_report
  }
}
