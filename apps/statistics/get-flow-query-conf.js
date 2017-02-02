'use strict';

var customError         = require('es5-ext/error/custom')
  , Set                 = require('es6-set')
  , db                  = require('../../db')
  , dateStringtoDbDate  = require('../../utils/date-string-to-db-date')
  , modes               = require('../../utils/statistics-flow-group-modes')
  , processingStepsMeta = require('../../processing-steps-meta')

  , stringify           = JSON.stringify;

module.exports = exports = function () {
	var conf;

	var availableServices = new Set();
	Object.keys(processingStepsMeta).forEach(function (stepShortPath) {
		processingStepsMeta[stepShortPath]._services.forEach(function (serviceName) {
			availableServices.add(serviceName);
		});
	});

	conf = [
		{
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
		},
		{
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
		},
		{
			name: 'service',
			ensure: function (value) {
				if (!value) return;
				if (!availableServices.has(value)) {
					throw new Error("Unrecognized service value " + stringify(value));
				}
				return value;
			}
		},
		{
			name: 'mode',
			ensure: function (value) {
				if (!value) value = 'daily';
				if (!modes.some(function (mode) {
						return mode.key === value;
					})) {
					throw new Error("Unrecognized mode value " + stringify(value));
				}
				return value;
			}
		}
	];

	return conf;
};
