process.env.CHROME_BIN = require('puppeteer').executablePath()
console.log(process.env.CHROME_BIN);
module.exports = function (config) {
    config.set({
        browsers: ['ChromeHeadlessNoSandbox'],
        customLaunchers: {
          ChromeHeadlessNoSandbox: {
          base: 'ChromeHeadless',
          flags: ['--no-sandbox']
          }
        },
        frameworks: ['mocha', 'chai'],
        files: [
          { pattern: 'node_modules/babel-polyfill/browser.js', instrument: false},
          'dist/api-spec-converter.js',
          'test/setup/browser.js',
          'test/test-cases.js',
          'test/*.js',
          {pattern: 'test/input/**/*', included: false, watched: false, served: true},
          {pattern: 'test/output/**/*', included: false, watched: false, served: true}
        ],

        proxies: {
          '/test/': '/base/test/'
        },

        reporters: ['mocha'],

        browserNoActivityTimeout: 30000
    });
}
