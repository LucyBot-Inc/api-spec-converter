module.exports = function (config) {
    var travis = process.env.TRAVIS;
    config.set({
        frameworks: ['mocha', 'chai'],
        files: [
          'node_modules/babel-polyfill/dist/polyfill.js',
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

        browsers: ['PhantomJS'],

        browserNoActivityTimeout: 30000
    });
}
