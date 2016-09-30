'use strict';

var db      = require('../../db')
  , daysOff = (db.globalPrimitives.holidays && db.globalPrimitives.holidays.map(Number));

module.exports = function (date) {
	if (!date || !date.constructor || date.constructor !== db.Date) {
		throw new Error("Date must be db date");
	}
	var dayOfWeek = db.Date.validate(date).getUTCDay();

	return dayOfWeek === 0 || dayOfWeek === 6 || (daysOff && daysOff.has(Number(date)));
};
