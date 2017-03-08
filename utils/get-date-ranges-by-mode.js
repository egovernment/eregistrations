'use strict';

var incrementDateByTimeUnit = require('./increment-date-by-time-unit')
  , copyDbDate              = require('./copy-db-date')
  , floorToTimeUnit         = require('./floor-to-time-unit');

module.exports = function (dateFrom, dateTo, mode) {
	var result = [], currentDate, previousDate, periodDateTo;
	currentDate  = copyDbDate(dateFrom);
	while (currentDate <= dateTo) {
		if (mode === 'daily') {
			result.push({ dateFrom: copyDbDate(currentDate), dateTo: copyDbDate(currentDate) });
		}
		previousDate = copyDbDate(currentDate);
		incrementDateByTimeUnit(currentDate, mode);
		// happens at most once, with first slice
		if (floorToTimeUnit(copyDbDate(currentDate), mode) !== currentDate) {
			floorToTimeUnit(currentDate, mode);
		}
		if (mode !== 'daily') {
			periodDateTo = copyDbDate(currentDate);
			// last looping, take dateTo
			if (currentDate > dateTo) {
				periodDateTo = copyDbDate(dateTo);
			} else {
				periodDateTo.setUTCDate(currentDate.getUTCDate() - 1);
			}
			result.push({ dateFrom: copyDbDate(previousDate), dateTo: periodDateTo });
		}
	}

	return result;
};
