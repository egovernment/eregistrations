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
		totalTime: 0
	};
};

module.exports = function () {
	return {
		processing: getTemplate(),
		correction: getTemplate()
	};
};
