'use strict';

var db             = require('../../db')
  , defineDbjsDate = require('dbjs-ext/date-time/date');

module.exports = function (t, a) {
	var date, dbDate;
	defineDbjsDate(db);
	date   = new db.Date();
	dbDate = t(date);
	date.setUTCFullYear(date.getUTCFullYear());
	date.setUTCMonth(date.getUTCMonth());
	date.setUTCDate(date.getUTCDate());

	a(dbDate.getUTCFullYear(), date.getUTCFullYear());
	a(dbDate.getUTCMonth(), date.getUTCMonth());
	a(dbDate.getUTCDate(), date.getUTCDate());
	a.throws(function () { t(new Date(), ['copyDbDate expects db date']); },
		new RegExp('copyDbDate expects db date'),
		'throws when given non dbjs');
};
