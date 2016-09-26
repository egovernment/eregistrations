'use strict';

var includes     = require('es5-ext/array/#/contains')
  , filter       = require('es5-ext/object/filter')
  , map          = require('es5-ext/object/map')
  , ensureObject = require('es5-ext/object/valid-object');

/**
	*
	* @param config
	* driver                  - Database driver
	* processingStepsMeta     - map of processing steps
	* db                      - dbjs database
	* query (optional)        - query past from controller
	* customFilter (optional) - function used to filter by system specific parameters
	* @returns {Object}
*/
module.exports = exports = function (data, query, processingStepsMeta) {
	(ensureObject(data) && ensureObject(query) && ensureObject(processingStepsMeta));

	// 1. Exclude not applicable steps
	if (query.step || query.service) {
		data = filter(data, function (stepData, stepShortPath) {
			// 1.1. Exclude by step
			if (query.step && query.step !== stepShortPath) return;

			// 1.2. Exclude by service
			if (query.service) {
				if (!includes.call(processingStepsMeta[stepShortPath]._services, query.service)) return;
			}
			return true;
		});
	}

	// 2. Filter items
	return map(data, function (stepData, stepShortPath) {

		// 2.1. Filter by service
		if (query.service && (processingStepsMeta[stepShortPath]._services.length > 1)) {
			stepData = filter(stepData, function (entry) {
				return entry.serviceName === query.service;
			});
		}

		// 2.2 Filter by date range
		if (query.dateFrom) {
			stepData = filter(stepData, function (entry) {
				return entry.processingDate >= query.dateFrom;
			});
		}
		if (query.dateTo) {
			stepData = filter(stepData, function (entry) {
				return entry.processingDate <= query.dateTo;
			});
		}

		// 2.3 Filter by pending at date
		if (query.pendingAt) {
			stepData = filter(stepData, function (entry) {
				return ((entry.pendingDate <= query.pendingAt) &&
					(!entry.processingDate || (entry.processingDate >= query.pendingAt)));
			});
		}

		// 2.4 Custom filter
		if (exports.customFilter) stepData = filter(stepData, exports.customFilter);

		return stepData;
	});
};
