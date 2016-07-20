'use strict';

var assign           = require('es5-ext/object/assign')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , ensureDriver     = require('dbjs-persistence/ensure-driver')
  , ensureDatabase   = require('dbjs/valid-dbjs')
  , ensureObject     = require('es5-ext/object/valid-object')
  , QueryHandler     = require('../../utils/query-handler')
  , Set              = require('es6-set')
  , getBaseRoutes    = require('./authenticated')
  , customError      = require('es5-ext/error/custom')
  , stringify        = JSON.stringify
  , dateStringtoDbDate = require('../../utils/date-string-to-db-date')
  , getProcessingTimesByStepProcessor =
		require('../statistics/get-processing-times-by-step-processor')
  , processingStepsMeta, db, availableServices;

module.exports = exports = function (data) {
	var options         = normalizeOptions(ensureObject(data));
	ensureDriver(options.driver);
	db                  = ensureDatabase(options.db);
	processingStepsMeta = options.processingStepsMeta;
	availableServices   = new Set();
	Object.keys(processingStepsMeta).forEach(function (stepShortPath) {
		processingStepsMeta[stepShortPath]._services.forEach(function (serviceName) {
			availableServices.add(serviceName);
		});
	});

	var queryHandler = new QueryHandler(exports.queryConf);

	return assign({
		'get-processing-time-data': function (query) {
			return queryHandler.resolve(query)(function (query) {
				return getProcessingTimesByStepProcessor(assign(options, { query: query }));
			});
		}
	}, getBaseRoutes());
};

exports.queryConf = [
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
		name: 'from',
		ensure: function (value, resolvedQuery, query) {
			var now = new db.Date(), fromDate, toDate;
			if (!value) return;
			fromDate = dateStringtoDbDate(db, value);
			if (fromDate > now) throw new Error('From cannot be in future');
			if (query.to) {
				toDate = dateStringtoDbDate(query.to);
				if (toDate < fromDate) throw new Error('Invalid date range');
			}
			return fromDate;
		}
	},
	{
		name: 'to',
		ensure: function (value) {
			var now = new db.Date(), toDate;
			if (!value) return;
			toDate = dateStringtoDbDate(db, value);
			if (toDate > now) {
				throw customError("To date cannot be in future", { fixedQueryValue: now });
			}
			return toDate;
		}
	}
];
