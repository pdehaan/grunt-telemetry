var assert = require("assert"), expect = require('expect.js'), telemetry = require('../tasks/lib/telemetry');

describe('When testing browsers', function() {
	this.timeout(0);
	it('should launch firefox', function(done) {
		telemetry.run(__dirname + '/1.html', 'chrome', function(data) {
			expect(data).to.have.property('load_time_ms');
			expect(data).to.have.property('dom_content_loaded_time_ms');
			done();
		});
	})
})
