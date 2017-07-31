module.exports = function (config) {
    var customLaunchers = {
      sl_chrome: {
        base: 'SauceLabs',
        browserName: 'chrome',
        platform: 'Windows 7',
        version: '35'
      },
      sl_firefox: {
        base: 'SauceLabs',
        browserName: 'firefox',
        version: '30'
      },
      sl_ie_11: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 8.1',
        version: '11'
      }
    };

    var browsers = ['PhantomJS'];
    if (process.env.SAUCE === "true") {
      browsers = browsers.concat(Object.keys(customLaunchers));
    }

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

        customLaunchers: customLaunchers,

        browsers: browsers,

        browserNoActivityTimeout: 30000
    });
}
