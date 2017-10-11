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
        timeout: 6000,
        files: ['tests/*.js']
      },
      local: {
        timeout: 25000
      }
    }
  });

  grunt.loadNpmTasks('grunt-node-version');
  
  grunt.loadNpmTasks('grunt-mocha-cli');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['node_version', 'mochacli:local']);
  grunt.registerTask('livetests', ['node_version', 'watch:tests']);

};