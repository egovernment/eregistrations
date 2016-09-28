'use strict';

var db      = require('../../db')
  , daysOff = (db.globalPrimitives.holidays && db.globalPrimitives.holidays.map(Number));

module.exports = function (date) {
	var dayOfWeek = db.Date.validate(date).getUTCDay();

	return dayOfWeek === 0 || dayOfWeek === 6 || (daysOff && daysOff.has(Number(date)));
};
