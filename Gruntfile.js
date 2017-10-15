const fs = require('fs');

module.exports = function(grunt) {

  grunt.initConfig({
    node_version: {
      /////// ensure you are using the node version required by your project's package.json
      options: {
        alwaysInstall: false,
        errorLevel: 'fatal',
        globals: [],
        maxBuffer: 200*1024,
        nvm: false,           //// try to `nvm use` first
        override: ''          ///// use version from package.json
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
        timeout: 60000,
        files: ['tests/*.js']
      },
      local: {
        timeout: 25000
      }
    }
  });

  /**
   * Custom task to dynamically configure the `mochacli.options.files` Array.
   * All filepaths that match the given globbing pattern(s), which is specified
   # via the `grunt.file.expand` method, will be sorted chronologically via each
   * file(s) latest modified date (i.e. mtime).
   */
  grunt.registerTask('runMochaTests', function configMochaTask() {
    var sortedPaths = grunt.file.expand({ filter: 'isFile' }, 'tests/**/*.js')
      .map(function(filePath) {
        return {
          fpath: filePath,
          modtime: fs.statSync(filePath).mtime.getTime()
        }
      })
      .sort(function (a, b) {
        return a.modtime - b.modtime;
      })
      .map(function (info) {
        return info.fpath;
      })
      .reverse();

    grunt.config('mochacli.options.files', sortedPaths);
    grunt.task.run(['mochacli:local']);
  });

  grunt.loadNpmTasks('grunt-node-version');
  
  grunt.loadNpmTasks('grunt-mocha-cli');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['node_version', 'runMochaTests']);
  grunt.registerTask('livetests', ['node_version', 'watch:tests']);

};