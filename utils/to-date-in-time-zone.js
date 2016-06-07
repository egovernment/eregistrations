'use strict';

var ensureDate   = require('es5-ext/date/valid-date')
  , ensureString = require('es5-ext/string/validate-stringifiable-value')
  , memoize      = require('memoizee/plain')
  , validDb      = require('dbjs/valid-dbjs');

// Convert any date to db.Date in specified time zone.
module.exports = memoize(function (db) {
	validDb(db);

	return function (date, timeZone) {
		ensureDate(date);
		if (isNaN(date)) throw new Error(date + " is invalid Date");
		timeZone = ensureString(timeZone);
		try {
			var res = new Date(date).toLocaleDateString('en', {
				timeZone: timeZone,
				year: 'numeric',
				month: '2-digit',
				day: '2-digit'
			}).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

			if (res) {
				return new db.Date(res[3], res[1] - 1, res[2]);
			}
		} catch (ignore) {}

		return new db.Date(date);
	};
}, { normalizer: require('memoizee/normalizers/get-1')() });
