module.exports = function(grunt) {

  grunt.initConfig({
    concurrent: {
      tests: {
        tasks: ['nodemon:tests', 'watch:tests'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    nodemon: {
      tests: {
        script: 'index.js',
        options: {
          ext: 'js',
          watch: ['**/*.js', '**/*.json'],
          nodeArgs: ['--debug'],
          callback: function(nodemon) {
            nodemon.on('log', function(event) {
              console.log(event.colour);
            });
            nodemon.on('restart', function() {
              require('fs').writeFileSync('.rebooted', 'rebooted');
            });
          }
        }
      }
    },
    watch: {
      tests: {
        files: ['**/*.js', '!**/node_modules/**'],
        tasks: ['mochacli:local']
      }
    },
    mochacli: {
      options: {
        require: ['assert'],
        reporter: 'spec',
        bail: true,
        timeout: 6000,
        files: ['tests/*.js']
      },
      local: {
        timeout: 25000
      }
    }
  });

  grunt.loadNpmTasks('grunt-mocha-cli');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['mochacli:local']);
  grunt.registerTask('livetests', ['watch:tests']);

};