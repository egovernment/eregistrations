'use strict';

var db      = require('../../db')
  , daysOff = (db.globalPrimitives && db.globalPrimitives.holidays &&
			db.globalPrimitives.holidays.map(Number));

module.exports = function (date) {
	if (!date || !date.constructor || date.constructor !== db.Date) {
		throw new Error("Date must be db date");
	}
	var dayOfWeek = date.getUTCDay();

	return dayOfWeek === 0 || dayOfWeek === 6 || (daysOff && daysOff.has(Number(date)));
};
