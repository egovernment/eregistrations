// Return date which will correspond to input date time but in specified time-zone

'use strict';

var ensureDate   = require('es5-ext/date/valid-date')
  , ensureString = require('es5-ext/object/validate-stringifiable-value');

module.exports = function (date, timeZone) {
	var result;

	ensureDate(date);
	timeZone = ensureString(timeZone);

	try {
		result = date.toLocaleString('en', { timeZone: timeZone })
			.match(/^(\d{1,2})\/(\d{1,2})\/(\d{1,4}), (\d{1,2}):(\d{2}):(\d{2}) ([AP])M$/);
	} catch (ignore) {}

	if (result) {
		return new Date(result[3], result[1] - 1, result[2],
			Number(result[4]) + ((result[7] === 'P') ? 12 : 0), result[5], result[6],
			date.getMilliseconds());
	}

	return date;
};
