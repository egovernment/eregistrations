'use strict';

var ensureDate   = require('es5-ext/date/valid-date')
  , ensureString = require('es5-ext/object/validate-stringifiable-value')
  , db           = require('../db');

// Convert any date to db.Date in specified time zone.
module.exports = function (date, timeZone) {
	var result;

	ensureDate(date);
	timeZone = ensureString(timeZone);
	if (!db.Date) throw new Error("Missing `Date` type defined on database");

	try {
		result = date.toLocaleDateString('en', {
			timeZone: timeZone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		}).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
	} catch (ignore) {}

	if (result) return new db.Date(result[3], result[1] - 1, result[2]);

	return new db.Date(date.getFullYear(), date.getMonth(), date.getDate());
};
