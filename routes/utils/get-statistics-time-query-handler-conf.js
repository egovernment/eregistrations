'use strict';

var normalizeOptions   = require('es5-ext/object/normalize-options')
  , ensureDatabase     = require('dbjs/valid-dbjs')
  , ensureObject       = require('es5-ext/object/valid-object')
  , Set                = require('es6-set')
  , customError        = require('es5-ext/error/custom')
  , stringify          = JSON.stringify
  , dateStringtoDbDate = require('../../utils/date-string-to-db-date')
  , processingStepsMeta, db, availableServices;

var queryConf = [
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
		name: 'dateFrom',
		ensure: function (value, resolvedQuery, query) {
			var now = new db.Date(), dateFrom, dateTo;
			if (!value) return;
			dateFrom = dateStringtoDbDate(db, value);
			if (dateFrom > now) throw new Error('From cannot be in future');
			if (query.dateTo) {
				dateTo = dateStringtoDbDate(db, query.dateTo);
				if (dateTo < dateFrom) throw new Error('Invalid date range');
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
				throw customError("To date cannot be in future", { fixedQueryValue: now });
			}
			return dateTo;
		}
	}
];

module.exports = function (data) {
	var options         = normalizeOptions(ensureObject(data));
	db                  = ensureDatabase(options.db);
	processingStepsMeta = options.processingStepsMeta;
	availableServices   = new Set();
	Object.keys(processingStepsMeta).forEach(function (stepShortPath) {
		processingStepsMeta[stepShortPath]._services.forEach(function (serviceName) {
			availableServices.add(serviceName);
		});
	});
	return queryConf;
};
