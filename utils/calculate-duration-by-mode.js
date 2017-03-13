'use strict';

var db                      = require('../db')
  , copyDbDate              = require('./copy-db-date')
  , incrementDateByTimeUnit = require('./increment-date-by-time-unit')
  , floorTimeToUnit         = require('./floor-to-time-unit');

module.exports = function (dateFrom, dateTo, mode) {
	var timeUnitsCount = 0, currentDate;
	currentDate = copyDbDate(dateFrom);
	if (!dateTo) dateTo = new db.Date();

	floorTimeToUnit(currentDate, mode);
	while (currentDate <= dateTo) {
		incrementDateByTimeUnit(currentDate, mode);
		timeUnitsCount++;
	}
	return timeUnitsCount;
};
