'use strict';

var includes       = require('es5-ext/array/#/contains')
  , filter         = require('es5-ext/object/filter')
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

	return getData(driver, processingStepsMeta)(function (data) {

		// 1. Exclude not applicable steps
		data = filter(data.steps, function (stepData, stepShortPath) {
			// 1.1. Exclude by step
			if (query.step && query.step !== stepShortPath) return;

			// 1.2. Exclude by service
			if (query.service) {
				if (!includes.call(processingStepsMeta[stepShortPath]._services, query.service)) return;
			}
			return true;
		});

		// 2. Filter items
		var newData = Object.create(null);
		return deferred.map(Object.keys(data), function (stepShortPath) {
			var stepData = data[stepShortPath];

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

			if (!customFilter) {
				newData[stepShortPath] = stepData;
				return;
			}

			// 2.3. Custom filter
			var newStepData = newData[stepShortPath] = Object.create(null);
			return deferred.map(Object.keys(stepData), function (businessProcessId) {
				var entry = stepData[businessProcessId];
				return customFilter(entry, query)(function (isOk) {
					if (isOk) newStepData[businessProcessId] = entry;
				}.bind(this));
			});
		})(newData);
	});
};
