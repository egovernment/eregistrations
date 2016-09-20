'use strict';

var d    = require('d')
  , lazy = require('d/lazy');

var DataTemplate = function () {};
Object.defineProperties(DataTemplate.prototype, {
	// Count of items
	count: d(0),
	// Average time
	avgTime: d(0),
	// Shortest time
	minTime: d(Infinity),
	// Longest time
	maxTime: d(0),
	// Sum of all times
	totalTime: d(0)
});

var DataTemplateGroup = function () {};
Object.defineProperties(DataTemplateGroup.prototype, lazy({
	processing: d('cew', function () { return new DataTemplate(); }),
	correction: d('cew', function () { return new DataTemplate(); })
}));

module.exports = function () { return new DataTemplateGroup(); };
