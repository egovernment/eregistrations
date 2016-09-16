'use strict';

var includes         = require('es5-ext/array/#/contains')
  , assign           = require('es5-ext/object/assign')
  , ensureObject     = require('es5-ext/object/valid-object')
  , ensureCallable   = require('es5-ext/object/valid-callable')
  , deferred         = require('deferred')
  , memoize          = require('memoizee')
  , ensureDatabase   = require('dbjs/valid-dbjs')
  , unserializeValue = require('dbjs/_setup/unserialize/value')
  , ensureDriver     = require('dbjs-persistence/ensure-driver')
  , getData          = require('./map');

var getProcessorAndProcessingTime = memoize(function (data) {
	var result = {};
	return deferred(
		data.storage.get(data.id + '/' + data.stepFullPath + '/processor')(
			function (processorData) {
				if (!processorData || processorData.value[0] !== '7') return;
				result.processor = processorData.value.slice(1);
			}
		),
		data.storage.get(data.id + '/' + data.stepFullPath + '/correctionTime')(
			function (correctionTimeData) {
				if (!correctionTimeData || correctionTimeData.value[0] !== '2') return;
				result.correctionTime =
					unserializeValue(correctionTimeData.value);
			}
		),
		data.storage.get(data.id + '/' + data.stepFullPath + '/processingTime')(
			function (processingTimeData) {
				if (!processingTimeData || processingTimeData.value[0] !== '2') return;
				result.processingTime =
					unserializeValue(processingTimeData.value);
			}
		)
	)(result);
}, {
	normalizer: function (args) { return args[0].id + args[0].stepFullPath; },
	// One hour
	maxAge: 1000 * 60 * 60
});
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
			var entries = businessProcessesByStepsMap[stepShortPath];

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
					return data.date >= query.dateFrom;
				});
			}
			if (query.dateTo) {
				entries = entries.filter(function (data) {
					return data.date <= query.dateTo;
				});
			}

			// 5. Custom filter
			if (customFilter) {
				entries = deferred.map(entries, function (entry) {
					return customFilter(entry, query)(function (isOK) { return isOK ? entry : null; });
				}).invoke('filter', Boolean);
			}
			return deferred(entries)(function (filteredEntries) {
				entries = filteredEntries;

				// 6. Get extra data for each entry
				return deferred.map(entries, function (data) {
					return getProcessorAndProcessingTime(data)(function (result) {
						assign(data, result);
					});
				});
			})(function () { result[stepShortPath] = entries; });
		});
	})(result);
};
