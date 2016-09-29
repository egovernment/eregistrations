'use strict';

var aFrom              = require('es5-ext/array/from')
  , ensureArray        = require('es5-ext/array/valid-array')
  , customError        = require('es5-ext/error/custom')
  , normalizeOptions   = require('es5-ext/object/normalize-options')
  , Set                = require('es6-set')
  , db                 = require('../../db')
  , dateStringtoDbDate = require('../../utils/date-string-to-db-date')

  , stringify          = JSON.stringify;

var queryConf = [
	{
		name: 'dateFrom',
		ensure: function (value, resolvedQuery, query) {
			var now = new db.Date(), dateFrom, dateTo;
			if (query.dateTo) {
				dateTo = dateStringtoDbDate(db, query.dateTo);
			}
			if (!value) {
				if (dateTo) {
					return new db.Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate() - 6);
				}
				// last week by default
				return new db.Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
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
	}
];

module.exports = exports = function (data) {
	var options = normalizeOptions(data)
	  , processingStepsMeta = options.processingStepsMeta
	  , conf = aFrom(queryConf);

	var availableServices = new Set();
	if (processingStepsMeta) {
		Object.keys(processingStepsMeta).forEach(function (stepShortPath) {
			processingStepsMeta[stepShortPath]._services.forEach(function (serviceName) {
				availableServices.add(serviceName);
			});
		});
	}

	conf.push({
		name: 'service',
		ensure: function (value) {
			if (!value) return;
			if (!availableServices.has(value)) {
				throw new Error("Unrecognized service value " + stringify(value));
			}
			return value;
		}
	}, {
		name: 'step',
		ensure: function (value) {
			if (!value) return;
			if (!processingStepsMeta[value]) {
				throw new Error("Unrecognized step value " + stringify(value));
			}
			return value;
		}
	});

	if (exports.customQueryConf) {
		ensureArray(exports.customQueryConf).forEach(function (confItem) {
			conf.push(confItem);
		});
	}

	return conf;
};
