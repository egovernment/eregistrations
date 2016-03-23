'use strict';

var db = require('mano').db;

// Convert any date to db.Date in specified time zone.
module.exports = function (date, timeZone) {
	try {
		var res = new Date(date).toLocaleDateString('en', {
			timeZone: timeZone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		}).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

		if (res) {
			return new db.Date(res[3], res[1] - 1, res[2]);
		}
	} catch (ignore) {}

	return new db.Date(date);
};
