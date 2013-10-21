module.exports = (function() {
	var browserConfig = null, browsers = {
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

	/**
	 * Takes a page component and inserts all the telemetry scripts into the page
	 */
	function telemetryPage(page) {
		var fs = require('fs'), pageScripts = [ '\n<script type = "text/javascript">\n' ];
		[ 'smoothness_measurement.js', 'scroll.js', 'benchmarks.js' ].forEach(function(file) {
			pageScripts.push(fs.readFileSync(__dirname + '/page_scripts/' + file, 'utf-8'));
		});
		pageScripts.push('</script>');

		var html = fs.readFileSync(page, 'utf-8');

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

	/**
	 * Serves the pages that need to be tested
	 */
	function runServer(page, cb) {
		var express = require('express');
		var app = express();
		app.use(express.bodyParser());
		app.use(express.methodOverride());

		app.get('/', function(req, res) {
			res.send(telemetryPage(page));
		});

		app.post('/data', function(req, res) {
			var data = req.body;
			data['url'] = page;
			res.send('');
			if (typeof cb === 'function') {
				server.close();
				cb(data);
			}
		});
		var server = app.listen(3000);
	}

	function openPageInBrowser(browserName, page, cb) {
		if (typeof cb !== 'function') {
			cb = new Function();
		}
		var launcher = require('browser-launcher');
		launcher(browserConfig || {}, function(err, launch) {
			if (err) {
				cb(err);
			} else {
				launch('http://localhost:3000/?' + Math.random(), browsers[browserName], function(err, ps) {
					cb(err, ps);
				});
			}
		});
	}

	return {
		setup : function(opts) {
			browserConfig = opts;
		},

		availableBrowsers : function() {
			return browsers;
		},

		serve : function(page) {
			runServer(page);
		},

		run : function(page, browserName, cb) {
			var browser = null, closed = false;
			var close = function(data) {
				if (closed) {
					return;
				}
				browser && browser.kill();
				closed = true;
				cb(data);
			}

			runServer(page, function(data) {
				close(data);
			});

			openPageInBrowser(browserName, page, function(err, ps) {
				if (ps) {
					ps.on('exit', function() {
						close();
					});
					browser = ps;
				} else {
					console.log(err);
					close();
				}
			});
		}

	}

}());