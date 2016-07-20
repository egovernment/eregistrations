'use strict';

var isNaturalNumber  = require('es5-ext/number/is-natural')
  , assign           = require('es5-ext/object/assign')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , ensureDriver     = require('dbjs-persistence/ensure-driver')
  , ensureObject     = require('es5-ext/object/valid-object')
  , QueryHandler     = require('../../utils/query-handler')
  , getBaseRoutes    = require('./authenticated')
  , idToStorage      = require('../utils/business-process-id-to-storage')
  , stringify        = JSON.stringify
  , getClosedProcessingStepsStatuses = require('../statistics/get-closed-processing-steps-statuses')
  , deferred         = require('deferred')
  , unserializeValue = require('dbjs/_setup/unserialize/value')
  , driver, processingStepsMeta;

var getData = function (query) {
	var result = {};
	return getClosedProcessingStepsStatuses(driver, processingStepsMeta)(
		function (businessProcessesByStepsMap) {
			if (!businessProcessesByStepsMap) return;
			return deferred.map(Object.keys(businessProcessesByStepsMap),
				function (stepName) {
					var entries = businessProcessesByStepsMap[stepName];
					if (query.service) {
						entries = businessProcessesByStepsMap[stepName].filter(function (entry) {
							return entry.serviceName === query.service;
						});
					}
					result[stepName] = [];

					if (exports.customFilter) {
						entries = entries.filter(exports.customFilter);
					}
					if (query.from) {
						entries = entries.filter(function (data) {
							return data.data.stamp >= query.from;
						});
					}
					if (query.to) {
						entries = entries.filter(function (data) {
							return data.data.stamp <= query.to;
						});
					}
					return deferred.map(entries, function (data) {
						data.sideData = {};
						return idToStorage(data.id)(function (storage) {
							return deferred(
								storage.get(data.id + '/processingSteps/map/' + stepName + '/processor')(
									function (processorData) {
										if (!processorData || !processorData.value) return;
										data.sideData.processor = processorData.value.slice(1);
									}
								).done(),
								storage.get(data.id + '/processingSteps/map/' + stepName + '/processingTime')(
									function (processingTimeData) {
										if (!processingTimeData || !processingTimeData.value) return;
										data.sideData.processingTime =
											Number(unserializeValue(processingTimeData.value));
									}
								).done()
							);
						});
					})(function () {
						var dataByProcessors = {};
						entries.forEach(function (entry) {
							// Older businessProcess don't have processingTime, so tehy're useless here
							if (!entry.sideData.processingTime) return;
							if (!dataByProcessors[entry.sideData.processor]) {
								dataByProcessors[entry.sideData.processor] = {
									operator: entry.sideData.processor,
									processed: 0,
									avgTime: 0,
									minTime: 0,
									maxTime: 0,
									totalTime: 0
								};
							}
							dataByProcessors[entry.sideData.processor].processed++;
							if (!dataByProcessors[entry.sideData.processor].minTime ||
									entry.sideData.processingTime <
									dataByProcessors[entry.sideData.processor].minTime) {
								dataByProcessors[entry.sideData.processor].minTime = entry.sideData.processingTime;
							}
							if (!dataByProcessors[entry.sideData.processor].maxTime ||
									entry.sideData.processingTime >
									dataByProcessors[entry.sideData.processor].maxTime) {
								dataByProcessors[entry.sideData.processor].maxTime = entry.sideData.processingTime;
							}
							dataByProcessors[entry.sideData.processor].totalTime += entry.sideData.processingTime;
							dataByProcessors[entry.sideData.processor].avgTime =
								dataByProcessors[entry.sideData.processor].totalTime /
								dataByProcessors[entry.sideData.processor].processed;
						});
						result[stepName] = Object.keys(dataByProcessors).map(function (processorId) {
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
	processingStepsMeta = data.processingStepsMeta;

	var queryHandler = new QueryHandler(exports.queryConf);

	return assign({
		'get-processing-time-data': function (query) {
			return queryHandler.resolve(query)(function (query) { return getData(query); });
		}
	}, getBaseRoutes());
};

exports.customFilter = null;

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
		ensure: function (value) {
			if (!value) return;
			if (isNaN(value)) throw new Error("Unrecognized from value" + stringify(value));
			var num = Number(value);
			if (!isNaturalNumber(num)) throw new Error("Unexpected from value " + stringify(value));
			var fromDate = new Date(num);
			if (fromDate > new Date()) throw new Error('From cannot be in future');
			// we want to use micro
			return num * 1000;
		}
	},
	{
		name: 'to',
		ensure: function (value) {
			if (!value) return;
			if (isNaN(value)) throw new Error("Unrecognized to value " + stringify(value));
			var num = Number(value);
			if (!isNaturalNumber(num)) throw new Error("Unexpected to value" + stringify(value));
			// we want to use micro
			return num * 1000;
		}
	}
];
