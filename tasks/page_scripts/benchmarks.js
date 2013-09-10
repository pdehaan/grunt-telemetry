/**
 Script inserted into the page to collect various benchmarks
**/

'use strict';

(function(window, undefined) {
	var results = {};

	function extend(obj1, obj2) {
		for (var key in obj1) {
			if (typeof obj2[key] === 'undefined') {
				obj2[key] = obj1[key];
			}
		}
		return obj2;
	}

	document.addEventListener('load', function() {
		// Load Timing from page
		var load_timings = window.performance.timing;
		results['load_time_ms'] = load_timings['loadEventStart'] - load_timings['navigationStart']
		results['dom_content_loaded_time_ms'] = load_timings['domContentLoadedEventStart'] - load_timings['navigationStart'];

		// First Paint Time


		// Smoothness Benchmarks
		var stats = window.__RenderingStats();

		stats.start();
		var action = new __ScrollAction(function() {
			stats.stop();
		});
		action.start(document.body);
		stats.stop();
	}, true);

}(window));