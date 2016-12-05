'use strict';

var getTemplate = function () {
	return {
		// Count of items
		count: 0,
		// Shortest time
		minTime: Infinity,
		// Longest time
		maxTime: 0,
		// Sum of all times
		totalTime: 0,
		// Count only those which have processing time
		timedCount: 0
	};
};

module.exports = function () {
	return {
		startedCount: 0,
		processing: getTemplate(),
		correction: getTemplate()
	};
};
