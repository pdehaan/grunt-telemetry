module.exports = function(grunt) {
	grunt.registerMultiTask('telemetry', 'Runs telemetry tests on specified files', function() {
		var done = this.async();

		var www = __dirname + '/tmp',
			filesSrc = this.filesSrc;
		grunt.file.mkdir(www);
		addTelemetryScripts(this.filesSrc, www);

		var express = require('express');
		var app = express();
		app.use(express.static(www));
		app.post('/data', function(req, res) {
			// TODO - collect all data
			console.log(req);
			res.send('');
			//process.kill(browserProcessId);
			// TODO - Launch next browser
		});
		app.listen(3000);

		var browserProcessId = null;
		var launcher = require('browser-launcher');
		launcher(function(err, launch) {
			// TODO - Launch all browsers as configured
			launch('http://localhost:3000/' + filesSrc[0], {
				browser: 'ie'
			}, function(err, ps) {
				if (err) {
					grunt.log.err(err);
				} else {
					browserProcessId = ps.pid;
				}
			});
		});
	});

	function addTelemetryScripts(filesSrc, destDir) {
		var pageScripts = ['\n<script type = "text/javascript">\n'];
		['smoothness_measurement.js', 'scroll.js', 'benchmarks.js'].forEach(function(file) {
			pageScripts.push(grunt.file.read(grunt.file.expand(__dirname + '/lib/page_scripts/' + file)));
		});
		pageScripts.push('\n</script>\n');

		filesSrc.forEach(function(file) {
			if (!grunt.file.exists(file)) {
				grunt.log.warn('Source file "' + file + '" not found.');
				return false;
			}
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
			grunt.file.write(destDir + '/' + file, html);
		});
	}

}