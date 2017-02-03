'use strict';

var customError        = require('es5-ext/error/custom')
  , db                 = require('../../db')
  , dateStringtoDbDate = require('../../utils/date-string-to-db-date');

module.exports = {
	name: 'dateTo',
	ensure: function (value) {
		var now = new db.Date(), dateTo;
		if (!value) return;
		dateTo = dateStringtoDbDate(db, value);
		if (dateTo > now) {
			throw customError("To date cannot be in future", { fixedQueryValue: null });
		}
		return dateTo;
	}
};
