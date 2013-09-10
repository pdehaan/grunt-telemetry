'use strict';

module.exports = function(grunt) {
	grunt.initConfig({
		telemetry: {
			all: {
				src: ['test/*.html']
			}
		}
	});
	grunt.loadTasks('./tasks');

	grunt.registerTask('default', ['telemetry']);
};