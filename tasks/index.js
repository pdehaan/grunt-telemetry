'use strict';

module.exports = function(grunt) {
	grunt.registerMultiTask('telemetry', 'Runs telemetry tests on specified files', function() {

		var pageScripts = ['\n<script type = "text/javascript">\n'];
		['smoothness_measurement.js', 'scroll.js', 'benchmarks.js'].forEach(function(file) {
			pageScripts.push(grunt.file.read(grunt.file.expand(__dirname + '/page_scripts/' + file)));
		});
		pageScripts.push('\n</script>\n');

		function modifyHTML(src) {

		};

		var done = this.async();
		this.files.forEach(function(f) {
			var src = f.src.filter(function(filepath) {
				// Warn on and remove invalid source files (if nonull was set).
				if (!grunt.file.exists(filepath)) {
					grunt.log.warn('Source file "' + filepath + '" not found.');
					return false;
				} else {
					return true;
				}
			});

			if (src.length === 0) {
				grunt.log.warn('No source files specified');
				return;
			}

			grunt.file.mkdir(__dirname + '/tmp');
			src.forEach(function(file) {
				var html = grunt.file.read(file);
				if (html.match(/<head>/)) {
					html = html.replace(/<head>/, '<head>' + pageScripts.join(''));
				} else if (html.match(/<body>/)) {
					html = html.replace(/<body>/, '<body>' + pageScripts.join(''));
				} else if (html.match(/<html>/)) {
					html = html.replace(/<html>/, '<html>' + pageScripts.join(''));
				} else {
					html = pageScripts.join() + html;
				}
				grunt.file.write(__dirname + '/tmp/' + file, html);
			});
		});
	});
}