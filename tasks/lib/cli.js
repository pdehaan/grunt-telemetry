var program = require('commander'),
	telemetry = require('./telemetry');

program
	.command('serve <page>')
	.description('Serve telemetry <page>')
	.action(function(page) {
		telemetry.serve(page);
	});

program
	.command('run <page>')
	.description('Run telemetry for a <page>')
	.action(function(page) {
		telemetry.run(page, function(data) {
		});
	});

program
	.version('0.0.1')
	.parse(process.argv);