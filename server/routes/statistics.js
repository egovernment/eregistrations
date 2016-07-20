'use strict';

var assign           = require('es5-ext/object/assign')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , ensureDriver     = require('dbjs-persistence/ensure-driver')
  , ensureDatabase   = require('dbjs/valid-dbjs')
  , ensureObject     = require('es5-ext/object/valid-object')
  , QueryHandler     = require('../../utils/query-handler')
  , getBaseRoutes    = require('./authenticated')
  , stringify        = JSON.stringify
  , getClosedProcessingStepsStatuses = require('../statistics/get-closed-processing-steps-statuses')
  , deferred         = require('deferred')
  , unserializeValue = require('dbjs/_setup/unserialize/value')
  , driver, processingStepsMeta, db;

var getData = function (query) {
	var result = {};
	return getClosedProcessingStepsStatuses(driver, processingStepsMeta, db)(
		function (businessProcessesByStepsMap) {
			if (!businessProcessesByStepsMap) return;
			return deferred.map(Object.keys(businessProcessesByStepsMap),
				function (stepShortPath) {
					var entries = businessProcessesByStepsMap[stepShortPath];
					if (query.service) {
						entries = businessProcessesByStepsMap[stepShortPath].filter(function (entry) {
							return entry.serviceName === query.service;
						});
					}
					result[stepShortPath] = [];

					if (exports.customFilter) {
						entries = entries.filter(exports.customFilter);
					}
					if (query.from) {
						entries = entries.filter(function (data) {
							return data.date >= query.from;
						});
					}
					if (query.to) {
						entries = entries.filter(function (data) {
							return data.date <= query.to;
						});
					}
					return deferred.map(entries, function (data) {
						return deferred(
							data.storage.get(data.id + '/' + data.stepFullPath + '/processor')(
								function (processorData) {
									if (!processorData || processorData.value[0] !== '7') return;
									data.processor = processorData.value.slice(1);
								}
							).done(),
							data.storage.get(data.id + '/' + data.stepFullPath + '/processingTime')(
								function (processingTimeData) {
									if (!processingTimeData || processingTimeData.value[2] !== '2') return;
									data.processingTime =
										Number(unserializeValue(processingTimeData.value));
								}
							).done()
						);
					})(function () {
						var dataByProcessors = {};
						entries.forEach(function (entry) {
							// Should not happen, but it's not right place to crash due to data inconsistency
							if (!entry.processor) return;
							// Older businessProcess don't have processingTime, so they're useless here
							if (!entry.processingTime) return;
							if (!dataByProcessors[entry.processor]) {
								dataByProcessors[entry.processor] = {
									operator: entry.processor,
									processed: 0,
									avgTime: 0,
									minTime: Infinity,
									maxTime: 0,
									totalTime: 0
								};
							}
							dataByProcessors[entry.processor].processed++;
							if (!dataByProcessors[entry.processor].minTime ||
									entry.processingTime <
									dataByProcessors[entry.processor].minTime) {
								dataByProcessors[entry.processor].minTime = entry.processingTime;
							}
							if (!dataByProcessors[entry.processor].maxTime ||
									entry.processingTime >
									dataByProcessors[entry.processor].maxTime) {
								dataByProcessors[entry.processor].maxTime = entry.processingTime;
							}
							dataByProcessors[entry.processor].totalTime += entry.processingTime;
							dataByProcessors[entry.processor].avgTime =
								dataByProcessors[entry.processor].totalTime /
								dataByProcessors[entry.processor].processed;
						});
						result[stepShortPath] = Object.keys(dataByProcessors).map(function (processorId) {
							return dataByProcessors[processorId];
						});

						return result;
					});
				});
		}
	);
};

module.exports = exports = function (data) {
	data                = normalizeOptions(ensureObject(data));
	driver              = ensureDriver(data.driver);
	db                  = ensureDatabase(data.db);
	processingStepsMeta = data.processingStepsMeta;

	var queryHandler = new QueryHandler(exports.queryConf);

	return assign({
		'get-processing-time-data': function (query) {
			return queryHandler.resolve(query)(function (query) { return getData(query); });
		}
	}, getBaseRoutes());
};

exports.customFilter = null;

var parseDate = function (date) {
	date = Date.parse(date);
	if (isNaN(date)) throw new Error("Unrecognized date value" + stringify(date));
	date = new Date(date);
	return new db.Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

exports.queryConf = [
	{
		name: 'service',
		ensure: function (value) {
			var isService;
			if (!value) return;
			isService = Object.keys(processingStepsMeta).some(function (stepMeta) {
				return processingStepsMeta[stepMeta]._services.some(function (serviceName) {
					return serviceName === value;
				});
			});
			if (!isService) {
				throw new Error("Unreconized service value " + stringify(value));
			}
			return value;
		}
	},
	{
		name: 'from',
		ensure: function (value, resolvedQuery, query) {
			var now = new db.Date(), fromDate, toDate;
			if (!value) return;
			fromDate = parseDate(value);
			if (fromDate > now) throw new Error('From cannot be in future');
			if (query.to) {
				toDate = parseDate(query.to);
				if (toDate < fromDate) throw new Error('Invalid date range');
			}
			return fromDate;
		}
	},
	{
		name: 'to',
		ensure: function (value) {
			if (!value) return;
			return parseDate(value);
		}
	}
];
