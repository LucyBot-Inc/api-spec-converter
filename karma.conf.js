module.exports = function (config) {
    var browsers = ['PhantomJS'];

    config.set({
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

        browsers: browsers,

        browserNoActivityTimeout: 30000
    });
}
