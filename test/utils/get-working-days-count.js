'use strict';

var Database       = require('dbjs')
  , defineDate     = require('dbjs-ext/date-time/date')
  , defineHolidays = require('../../model/global-primitives/holidays');

module.exports = function (t, a) {
	var db = new Database()
	  , getWorkingDaysCount;

	defineDate(db);
	defineHolidays(db);
	getWorkingDaysCount = t(db, 'Europe/Poland');

	var start = new Date(2016, 0, 1);
	var end = new Date(2016, 0, 8);

	a.deep(getWorkingDaysCount(start, end), 5);
};
