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
                    transform: [['babelify', {'presets': ['es2015']}]]
                },
            }
        }
    });
    grunt.loadNpmTasks('grunt-browserify');
}
