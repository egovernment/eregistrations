'use strict';

var defineDate     = require('dbjs-ext/date-time/date')
  , db             = require('../../db')
  , defineHolidays = require('../../model/global-primitives/holidays');

defineDate(db);
defineHolidays(db);

module.exports = function (t, a) {
	var start = new Date(2016, 0, 1);
	var end = new Date(2016, 0, 8);

	a.deep(t(start, end, 'Europe/Poland'), 5);
};
