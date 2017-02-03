'use strict';

var customError        = require('es5-ext/error/custom')
  , db                 = require('../../db')
  , dateStringtoDbDate = require('../../utils/date-string-to-db-date');

module.exports = {
	name: 'dateFrom',
	ensure: function (value, resolvedQuery, query) {
		var now = new db.Date(), dateFrom, dateTo;
		if (query.dateTo) {
			dateTo = dateStringtoDbDate(db, query.dateTo);
		}
		if (!value) {
			if (dateTo) {
				return new db.Date(dateTo.getUTCFullYear(), dateTo.getUTCMonth(),
						dateTo.getUTCDate() - 6);
			}
			// last week by default
			return new db.Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6);
		}
		dateFrom = dateStringtoDbDate(db, value);
		if (dateFrom > now) {
			throw customError("From date cannot be in future", { fixedQueryValue: null });
		}
		if (dateTo) {
			if (dateTo < dateFrom) {
				throw customError("date 'from' cannot be younger than 'to'",
					{ fixedQueryValue: query.dateTo });
			}
		}
		return dateFrom;
	}
};
