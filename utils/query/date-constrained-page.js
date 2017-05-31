'use strict';

var db                      = require('../../db')
  , isNaturalNumber         = require('es5-ext/number/is-natural')
  , itemsPerPage            = require('../../conf/objects-list-unlimited-items-per-page')
  , calculateDurationByMode = require('../calculate-duration-by-mode');

module.exports = {
	name: 'page',
	ensure: function (value, resolvedQuery, query) {
		var num, dateFrom, dateTo, mode, durationInTimeUnits, resolvedValue;
		resolvedValue = value;
		if (resolvedValue == null) resolvedValue = '1';
		if (isNaN(resolvedValue)) throw new Error("Unrecognized page value " + JSON.stringify(value));
		num = Number(resolvedValue);
		if (!isNaturalNumber(num)) throw new Error("Unreconized page value " + JSON.stringify(value));
		if (num < 1) throw new Error("Unexpected page value " + JSON.stringify(value));

		dateFrom = resolvedQuery.dateFrom;
		dateTo = resolvedQuery.dateTo || new db.Date();
		mode = resolvedQuery.mode;
		durationInTimeUnits = calculateDurationByMode(dateFrom, dateTo, mode);
		resolvedQuery.pageCount = Math.ceil(durationInTimeUnits / itemsPerPage);
		if (num > resolvedQuery.pageCount) throw new Error("Page value overflow");
		return num;
	}
};
