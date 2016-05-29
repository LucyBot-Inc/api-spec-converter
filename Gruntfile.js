module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        outputFolder: "./dist",

        browserify: {
            main: {
                src: ['index.js'],
                dest: '<%= outputFolder %>/<%= pkg.name %>.js',
                options: {
                    browserifyOptions: { standalone: 'APISpecConverter' },
                    banner: '/*! <%= pkg.name %> <%= pkg.version %> */\n',
                    ignore: [
                      './lib/types/api_blueprint.js',
                    ],
                    transform: [['babelify', {'presets': ['es2015']}]]
                },
            }
        },
        connect: {
          server: {
            options: {
              base: "",
              port: 3333,
            }
          },
          keepalive: {
            options: {
              base: "",
              port: 3333,
              keepalive: true,
            }
          }
        },
        mocha_phantomjs: {
          test: {
            options: {
              urls: ['http://127.0.0.1:3333/test/browser/browser.html'],
              timeout: 5000,
              log: true,
              logErrors: true,
            }
          }
        },
        'saucelabs-mocha': {
          all: {
            options: {
              urls: ['http://127.0.0.1:3333/test/browser/browser.html'],
              build: process.env.CI_BUILD_NUMBER,
              testname: 'Sauce Unit Test for api-spec-converter',
              browsers: [{
                browserName: 'firefox',
                version: '42',
                platform: 'XP'
              }]
            }
          }
        }
    });
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-saucelabs');
    grunt.loadNpmTasks('grunt-mocha-phantomjs');
    grunt.registerTask('test-browser', ['browserify', 'connect:server', 'mocha_phantomjs']);
    grunt.registerTask('test-browser-sauce', ['browserify', 'connect:server', 'saucelabs-mocha']);
}
