'use strict';

module.exports = function () {
	return {
		// Count of finalized files/steps
		processed: 0,
		// Average processing time
		avgTime: 0,
		// Shortest processing time
		minTime: Infinity,
		// Longest processing time
		maxTime: 0,
		// Sum of all processing times
		totalTime: 0
	};
};
