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
                      './lib/types/io_docs.js',
                      './lib/types/google.js',
                      './lib/types/api_blueprint.js',
                      './lib/types/raml.js',
                    ]
                },
            }
        }
    });
    grunt.loadNpmTasks('grunt-browserify');
}
