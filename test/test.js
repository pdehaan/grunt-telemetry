var assert = require("assert"), expect = require('expect.js'), telemetry = require('../tasks/lib/telemetry');
telemetry.setup({
	"config" : __dirname + '/config.json'
});

describe('When testing browsers', function() {
	this.timeout(0);
	['firefox' ].forEach(function(browser) {
		it('should launch ' + browser, function(done) {
			telemetry.run(__dirname + '/1.html', browser, function(data) {
				expect(data).to.have.property('load_time_ms');
				expect(data).to.have.property('dom_content_loaded_time_ms');
				done();
			});
		});
	});
})
