'use strict';

var mano           = require('mano')
  , Database       = require('dbjs')
  , defineDate     = require('dbjs-ext/date-time/date')
  , defineHolidays = require('../../model/global-primitives/holidays');

var db = mano.db = new Database();
defineDate(db);
defineHolidays(db);

module.exports = function (t, a) {
	var start = new Date(2016, 0, 1);
	var end = new Date(2016, 0, 8);

	a.deep(t(start, end, 'Europe/Poland'), 5);
};
