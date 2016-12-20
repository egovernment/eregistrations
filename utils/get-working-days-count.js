'use strict';

var ensureDate       = require('es5-ext/date/valid-date')
  , ensureString     = require('es5-ext/object/validate-stringifiable-value')
  , db               = require('../db')
  , toDateInTimeZone = require('./to-date-in-time-zone')

  , daysOff          = db.globalPrimitives.holidays.map(Number);

var isDayOff = function (date) {
	var dayOfWeek = date.getUTCDay();

	return dayOfWeek === 0 || dayOfWeek === 6 || daysOff.has(Number(date));
};

module.exports = function (startDate, endDate, timeZone) {
	var daysPassed = 0;

	timeZone = ensureString(timeZone);
	startDate = toDateInTimeZone(ensureDate(startDate), timeZone);
	endDate = toDateInTimeZone(ensureDate(endDate), timeZone);

	while (startDate < endDate) {
		if (!isDayOff(startDate)) ++daysPassed;

		startDate.setUTCDate(startDate.getUTCDate() + 1);
	}

	return daysPassed;
};
