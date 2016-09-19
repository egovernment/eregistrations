'use strict';

var includes       = require('es5-ext/array/#/contains')
  , identity       = require('es5-ext/function/identity')
  , toArray        = require('es5-ext/object/to-array')
  , ensureObject   = require('es5-ext/object/valid-object')
  , ensureCallable = require('es5-ext/object/valid-callable')
  , deferred       = require('deferred')
  , ensureDriver   = require('dbjs-persistence/ensure-driver')
  , getData        = require('../get-data');

/**
	*
	* @param data
	* driver                  - Database driver
	* processingStepsMeta     - map of processing steps
	* db                      - dbjs database
	* query (optional)        - query past from controller
	* customFilter (optional) - function used to filter by system specific parameters
	* @returns {Object}
*/
module.exports = function (data) {
	var driver = ensureDriver(ensureObject(data).driver)
	  , processingStepsMeta = ensureObject(data.processingStepsMeta)
	  , query = data.query || {}
	  , customFilter = data.customFilter ? ensureCallable(data.customFilter) : null;

	var result = {};

	// 1. Get data for all processing steps from all services
	return getData(driver, processingStepsMeta)(function (businessProcessesByStepsMap) {
		return deferred.map(Object.keys(businessProcessesByStepsMap), function (stepShortPath) {
			var entries = toArray(businessProcessesByStepsMap[stepShortPath], identity);

			// 2. Filter by step
			if (query.step && query.step !== stepShortPath) return;

			// 3. Filter by service
			if (query.service) {
				if (!includes.call(processingStepsMeta[stepShortPath]._services, query.service)) {
					return;
				}
				if (processingStepsMeta[stepShortPath]._services.length > 1) {
					entries = businessProcessesByStepsMap[stepShortPath].filter(function (entry) {
						return entry.serviceName === query.service;
					});
				}
			}
			if (!entries.length) return;

			// 4. Filter by date range
			if (query.dateFrom) {
				entries = entries.filter(function (data) {
					return data.processingDate >= query.dateFrom;
				});
			}
			if (query.dateTo) {
				entries = entries.filter(function (data) {
					return data.processingDate <= query.dateTo;
				});
			}

			// 5. Custom filter
			if (customFilter) {
				entries = deferred.map(entries, function (entry) {
					return customFilter(entry, query)(function (isOK) { return isOK ? entry : null; });
				}).invoke('filter', Boolean);
			}
			return deferred(entries)(function (filteredEntries) {
				result[stepShortPath] = filteredEntries;
			});
		});
	})(result);
};
