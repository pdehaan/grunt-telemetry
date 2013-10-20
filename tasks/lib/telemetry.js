var fs = require('fs');

module.exports = (function() {
	var express = require('express');
	var app = express();
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	var browserConfig = null;

	// Takes a page component and inserts all the telemetry scripts into the
	// page

	function telemetryPage(page) {
		var pageScripts = [ '\n<script type = "text/javascript">\n' ];
		[ 'smoothness_measurement.js', 'scroll.js', 'benchmarks.js' ].forEach(function(file) {
			pageScripts.push(fs.readFileSync(__dirname + '/page_scripts/' + file, 'utf-8'));
		});
		pageScripts.push('</script>');

		var html = fs.readFileSync(page, 'utf-8');

		html.replace()

		if (html.match(/<head>/)) {
			html = html.replace(/<head>/, '<head>' + pageScripts.join(''));
		} else if (html.match(/<body>/)) {
			html = html.replace(/<body>/, '<body>' + pageScripts.join(''));
		} else if (html.match(/<html >/)) {
			html = html.replace(/<html>/, '<html>' + pageScripts.join(''));
		} else {
			html = pageScripts.join() + html;
		}

		return html;
	}

	// Serves the pages that need to be tested

	function servePage(page) {
		app.use('/tests/', express.static(__dirname + '/../tests/'));
		app.get('/', function(req, res) {
			res.send(telemetryPage(page));
		});
	}

	// URL where the data is posted

	function collectData(page, cb) {
		console.log('Listening for data for', page);
		app.post('/data', function(req, res) {
			console.log('Got telemetry data from the page');
			var data = req.body;
			data['url'] = page;
			cb(data);
			res.send('');
		});
	}

	var browsers = {
		'chrome' : {
			browser : 'chrome',
			options : [ '--enable-gpu-benchmarking', '--enable-threaded-compositing', '--cancel-first-run', '--bwsi', '--no-first-run' ]
		},
		'ie' : {
			browser : 'ie',
		// options : ['-extoff', '-private']
		},
		'firefox' : {
			browser : 'firefox'
		}
	};

	function openPageInBrowser(browserName, page, cb) {
		if (typeof cb !== 'function') {
			cb = new Function();
		}
		var launcher = require('browser-launcher');
		launcher(browserConfig || {}, function(err, launch) {
			if (err) {
				cb(false);
			} else {
				launch('http://localhost:3000/?' + Math.random(), browsers[browserName], function(err, ps) {
					cb(typeof ps === 'undefined' ? false : ps);
				});
			}
		});
	}

	return {
		setup : function(opts) {
			browserConfig = opts
		},

		serve : function(page) {
			console.log('Serving page at 3000');
			servePage(page);
			app.listen(3000);
		},

		run : function(page, browserName, cb) {
			servePage(page);
			var browser = null;
			collectData(page, function(data) {
				console.log('Data collected from the browser');
				close(data);
			});

			function close(data) {
				server.close();
				if (browser) {
					console.log('Closing Browser');
					browser.kill();
				}
				cb(data);
			}

			var server = app.listen(3000);
			openPageInBrowser(browserName, page, function(ps) {
				if (ps === false) {
					close();
				} else {
					browser = ps;
				}
			});
		},

		availableBrowsers : function() {
			return browsers;
		}
	}

}());