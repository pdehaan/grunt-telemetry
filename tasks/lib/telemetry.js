var fs = require('fs');

module.exports = (function() {
	var express = require('express');
	var app = express();
	app.use(express.bodyParser());
	app.use(express.methodOverride());

	// Takes a page component and inserts all the telemetry scripts into the
	// page

	function telemetryPage(page) {
		var pageScripts = [ '\n<script type = "text/javascript">\n' ];
		[ 'smoothness_measurement.js', 'scroll.js', 'benchmarks.js' ]
				.forEach(function(file) {
					pageScripts.push(fs.readFileSync(__dirname
							+ '/page_scripts/' + file, 'utf-8'));
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

	function openPageInBrowser(browserName, page, cb) {
		var launcher = require('browser-launcher');
		launcher({
			config : __dirname + "/config.json"
		}, function(err, launch) {
			if (err) {
				cb(false);
			} else {
				launch('http://localhost:3000/', {
					browser : browserName,
					options : ["--enable-gpu-benchmarking", "--enable-threaded-compositing"]
				}, function(err, ps) {
					cb(err ? err : ps);
				});
			}
		});
	}

	return {
		serve : function(page) {
			console.log('Serving page at 3000');
			servePage(page);
			app.listen(3000);
		},

		run : function(page, cb) {
			servePage(page);
			collectData(page, function(data) {});
			app.listen(3000);
			openPageInBrowser("chrome", page, cb);
		}
	}

}());