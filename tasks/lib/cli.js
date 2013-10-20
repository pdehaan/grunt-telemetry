var program = require('commander'),
	telemetry = require('./telemetry');

program
	.command('serve <page>')
	.description('Serve telemetry <page>, for testing')
	.action(function(page) {
		telemetry.serve(page);
	});

program
	.command('run <page>')
	.description('Run telemetry for a <page>')
	.action(function(page) {
		telemetry.run(page, program.browser, function(data) {
			console.log('Printing Data');
		});
	});

program
	.version('0.0.1')
	.option('-b, --browser [browserName]', 'Specify the browser to open the page in. One of ' + Object.keys(telemetry.availableBrowsers()), 'chrome')
	.parse(process.argv);
