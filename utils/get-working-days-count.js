'use strict';

var db               = require('../db')
  , toDateInTimeZone = require('./to-date-in-time-zone')(db)

  , daysOff          = db.globalPrimitives.holidays.map(Number);

var isDayOff = function (date) {
	var dayOfWeek = date.getUTCDay();

	return dayOfWeek === 0 || dayOfWeek === 6 || daysOff.has(Number(date));
};

module.exports = function (startDate, endDate, timeZone) {
	var daysPassed = 0;

	startDate = toDateInTimeZone(startDate, timeZone);
	endDate = toDateInTimeZone(endDate, timeZone);

	while (startDate < endDate) {
		if (!isDayOff(startDate)) ++daysPassed;

		startDate.setUTCDate(startDate.getUTCDate() + 1);
	}

	return daysPassed;
};
