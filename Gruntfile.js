'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    telemetry: {
      main: {
        src: ['test/*.html']
      }
    }
  });

  grunt.loadTasks('tasks');

  grunt.registerTask('default', ['telemetry']);
};