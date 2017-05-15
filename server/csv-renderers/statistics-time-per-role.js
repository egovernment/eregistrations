'use strict';

var ensureObject         = require('es5-ext/object/valid-object')
  , forEach              = require('es5-ext/object/for-each')
  , getDurationDaysHours = require('../../view/utils/get-duration-days-hours-fine-grain');

module.exports = function (result, config) {
	ensureObject(config);
	var data = [];

	forEach(result, function (stepData, key) {
		var step = stepData.processing || stepData;
		step.label = stepData.label;
		data.push(step);
	});

	return data.map(function (row) {
		return [
			JSON.stringify(row.label),
			row.timedCount,
			row.timedCount ? getDurationDaysHours(row.avgTime) : '',
			row.timedCount ? getDurationDaysHours(row.minTime) : '',
			row.timedCount ? getDurationDaysHours(row.maxTime) : ''
		].join();
	}).join('\n');
};
