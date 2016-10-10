// Retrive data for all steps of all files
// (map db data into meta objects for our needs)

'use strict';

var aFrom                         = require('es5-ext/array/from')
  , forEach                       = require('es5-ext/object/for-each')
  , capitalize                    = require('es5-ext/string/#/capitalize')
  , Set                           = require('es6-set')
  , Map                           = require('es6-map')
  , deferred                      = require('deferred')
  , memoize                       = require('memoizee')
  , unserializeValue              = require('dbjs/_setup/unserialize/value')
  , debugLoad                     = require('debug-ext')('load', 6)
  , humanize                      = require('debug-ext').humanize
  , resolveProcessingStepFullPath = require('../../utils/resolve-processing-step-full-path')
  , toDateInTz                    = require('../../utils/to-date-in-time-zone')
  , timeZone                      = require('../../db').timeZone;

var re = new RegExp('^([0-9a-z]+)\\/processingSteps\\/map\\/([a-zA-Z0-9]+' +
	'(?:\\/steps\\/map\\/[a-zA-Z0-9]+)*)\\/([a-z0-9A-Z\\/]+)$');

module.exports = exports = memoize(function (driver, processingStepsMeta) {
	var storageStepsMap = new Map(), stepShortPathMap = new Map()
	  , serviceFullShortNameMap = new Map()
	  , startTime = Date.now();

	var result = { steps: Object.create(null), businessProcesses: Object.create(null) };

	forEach(processingStepsMeta, function (meta, stepShortPath) {
		var stepPath = resolveProcessingStepFullPath(stepShortPath);
		stepShortPathMap.set(stepPath, stepShortPath);
		meta._services.forEach(function (serviceName) {
			var serviceFullName = 'businessProcess' + capitalize.call(serviceName)
			  , storage = driver.getStorage(serviceFullName);
			serviceFullShortNameMap.set(serviceFullName, serviceName);
			if (!storageStepsMap.has(storage)) storageStepsMap.set(storage, new Set());
			storageStepsMap.get(storage).add(stepPath);

		});

		result.steps[stepShortPath] = Object.create(null);
	});

	return deferred.map(aFrom(storageStepsMap), function (data) {
		var storage = data[0], stepPaths = data[1]
		  , serviceName = serviceFullShortNameMap.get(storage.name);

		var initStepDataset = function (stepPath, businessProcessId) {
			var stepShortPath = stepShortPathMap.get(stepPath);
			if (!result.steps[stepShortPath][businessProcessId]) {
				result.steps[stepShortPath][businessProcessId] = {
					stepFullPath: 'processingSteps/map/' + stepPath
				};
			}
			return result.steps[stepShortPath][businessProcessId];
		};
		var initBpDataset = function (businessProcessId) {
			if (!result.businessProcesses[businessProcessId]) {
				result.businessProcesses[businessProcessId] = { serviceName: serviceName };
			}
			return result.businessProcesses[businessProcessId];
		};

		// Listen for new records
		stepPaths.forEach(function (stepPath) {
			// Status
			forEach(exports.stepMetaMap, function (meta, stepKeyPath) {
				storage.on('key:processingSteps/map/' + stepPath + '/' + stepKeyPath, function (event) {
					if (event.type !== (meta.type || 'direct')) return;
					if (!meta.validate(event.data)) meta.delete(initStepDataset(stepPath, event.ownerId));
					else meta.set(initStepDataset(stepPath, event.ownerId), event.data);
				});
			});
		});
		forEach(exports.businessProcessMetaMap, function (meta, keyPath) {
			storage.on('key:' + keyPath, function (event) {
				if (event.type !== (meta.type || 'direct')) return;
				if (!meta.validate(event.data)) meta.delete(initBpDataset(event.ownerId));
				else meta.set(initBpDataset(event.ownerId), event.data);
			});
		});

		// Get current records
		return deferred(
			storage.search(function (id, record) {
				var index = id.indexOf('/'), stepPath, stepKeyPath, meta;
				if (index === -1) return;
				var businessProcessId = id.slice(0, index)
				  , keyPath = id.slice(index + 1);
				meta = exports.businessProcessMetaMap[keyPath];
				if (meta) {
					if (meta.type && (meta.type !== 'direct')) return;
					if (!meta.validate(record)) return;
					meta.set(initBpDataset(businessProcessId), record);
				}
				var match = id.match(re);
				if (!match) return;
				stepPath = match[2];
				if (!stepPaths.has(stepPath)) return;
				stepKeyPath = match[3];
				meta = exports.stepMetaMap[stepKeyPath];
				if (!meta) return;
				if (meta.type && (meta.type !== 'direct')) return;
				if (!meta.validate(record)) return;
				meta.set(initStepDataset(stepPath, businessProcessId), record);
			}),
			deferred.map(Object.keys(exports.businessProcessMetaMap), function (keyPath) {
				var meta = exports.businessProcessMetaMap[keyPath];
				if (meta.type !== 'computed') return;
				return storage.searchComputed({ keyPath: keyPath }, function (id, record) {
					if (!meta.validate(record)) return;
					meta.set(initBpDataset(id.split('/', 1)[0]), record);
				});
			}),
			deferred.map(aFrom(stepPaths), function (stepPath) {
				return deferred.map(Object.keys(exports.stepMetaMap), function (stepPropKeyPath) {
					var meta = exports.stepMetaMap[stepPropKeyPath];
					if (meta.type !== 'computed') return;
					var keyPath = 'processingSteps/map/' + stepPath + '/' + stepPropKeyPath;
					return storage.searchComputed({ keyPath: keyPath }, function (id, record) {
						if (!meta.validate(record)) return;
						meta.set(initStepDataset(stepPath, id.split('/', 1)[0]), record);
					});
				});
			})
		);
	})(result).aside(function () {
		debugLoad('business process db data (in %s)', humanize(Date.now() - startTime));
	});

}, { length: 0 });

// Map of all properties to be mapped to result with corresponding instructions
exports.stepMetaMap = {
	status: {
		validate: function (record) {
			return ((record.value === '3approved') || (record.value === '3rejected'));
		},
		set: function (data, record) {
			data.processingDate = toDateInTz(new Date(record.stamp / 1000), timeZone);
			data.processingDateTime = new Date(record.stamp / 1000);
		},
		delete: function (data) {
			delete data.processingDate;
			delete data.processingDateTime;
		}
	},
	processor: {
		validate: function (record) { return (record.value[0] === '7'); },
		set: function (data, record) { data.processor = record.value.slice(1); },
		delete: function (data) { delete data.processor; }
	},
	correctionTime: {
		validate: function (record) { return (record.value[0] === '2'); },
		set: function (data, record) { data.correctionTime = unserializeValue(record.value); },
		delete: function (data) { delete data.correctionTime; }
	},
	processingHolidaysTime: {
		validate: function (record) { return (record.value[0] === '2'); },
		set: function (data, record) { data.processingHolidaysTime = unserializeValue(record.value); },
		delete: function (data) { delete data.processingHolidaysTime; }
	},
	isReady: {
		type: 'computed',
		validate: function (record) { return (record.value === '11'); },
		set: function (data, record) {
			data.pendingDate = toDateInTz(new Date(record.stamp / 1000), timeZone);
			data.pendingDateTime = new Date(record.stamp / 1000);
		},
		delete: function (data) {
			delete data.pendingDate;
			delete data.pendingDateTime;
		}
	}
};

exports.businessProcessMetaMap = {
	correctionTime: {
		validate: function (record) { return (record.value[0] === '2'); },
		set: function (data, record) { data.correctionTime = unserializeValue(record.value); },
		delete: function (data) { delete data.correctionTime; }
	},
	isApproved: {
		validate: function (record) { return (record.value === '11'); },
		set: function (data, record) {
			data.approvedDateTime = new Date(record.stamp / 1000);
			data.approvedDate = toDateInTz(data.approvedDateTime, timeZone);
		},
		delete: function (data) {
			delete data.approvedDateTime;
			delete data.approvedDate;
		}
	},
	isSubmitted: {
		validate: function (record) { return (record.value === '11'); },
		set: function (data, record) {
			data.submissionDateTime = new Date(record.stamp / 1000);
		},
		delete: function (data) { delete data.submissionDateTime; }
	},
	processingHolidaysTime: {
		validate: function (record) { return (record.value[0] === '2'); },
		set: function (data, record) { data.processingHolidaysTime = unserializeValue(record.value); },
		delete: function (data) { delete data.processingHolidaysTime; }
	}
};
