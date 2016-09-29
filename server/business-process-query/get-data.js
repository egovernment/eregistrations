// Retrive data for all steps of all files
// (map db data into meta objects for our needs)

'use strict';

var aFrom                         = require('es5-ext/array/from')
  , forEach                       = require('es5-ext/object/for-each')
  , capitalize                    = require('es5-ext/string/#/capitalize')
  , includes                      = require('es5-ext/string/#/contains')
  , Set                           = require('es6-set')
  , Map                           = require('es6-map')
  , deferred                      = require('deferred')
  , memoize                       = require('memoizee')
  , unserializeValue              = require('dbjs/_setup/unserialize/value')
  , resolveKeyPath                = require('dbjs/_setup/utils/resolve-key-path')
  , resolveEventKeys              = require('dbjs-persistence/lib/resolve-event-keys')
  , debugLoad                     = require('debug-ext')('load', 6)
  , humanize                      = require('debug-ext').humanize
  , resolveProcessingStepFullPath = require('../../utils/resolve-processing-step-full-path')
  , toDateInTz                    = require('../../utils/to-date-in-time-zone')
  , timeZone                      = require('../../db').timeZone;

var re = new RegExp('^processingSteps\\/map\\/([a-zA-Z0-9]+' +
	'(?:\\/steps\\/map\\/[a-zA-Z0-9]+)*)\\/([a-z0-9A-Z\\/]+)$');

module.exports = exports = memoize(function (driver, processingStepsMeta) {
	var storageStepsMap = new Map(), stepShortPathMap = new Map()
	  , serviceFullShortNameMap = new Map()
	  , startTime = Date.now();

	var result = { steps: new Map(), businessProcesses: new Map() };

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

		result.steps.set(stepShortPath, new Map());
	});

	return deferred.map(aFrom(storageStepsMap), function (data) {
		var storage = data[0], stepPaths = data[1]
		  , serviceName = serviceFullShortNameMap.get(storage.name);

		var initStepDataset = function (stepPath, businessProcessId) {
			var stepShortPath = stepShortPathMap.get(stepPath);
			if (!result.steps.get(stepShortPath).get(businessProcessId)) {
				result.steps.get(stepShortPath).set(businessProcessId, {
					stepShortPath: stepShortPath,
					businessProcessId: businessProcessId,
					stepFullPath: 'processingSteps/map/' + stepPath
				});
			}
			return result.steps.get(stepShortPath).get(businessProcessId);
		};
		var initBpDataset = function (businessProcessId) {
			if (!result.businessProcesses.has(businessProcessId)) {
				result.businessProcesses.set(businessProcessId,  {
					businessProcessId: businessProcessId,
					serviceName: serviceName
				});
			}
			return result.businessProcesses.get(businessProcessId);
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
				var bpId = id.split('/', 1)[0], stepPath, stepKeyPath, meta, keyPath, multiItemValue, path;
				if (bpId === id) return;
				if (includes.call(id, '*')) {
					keyPath = resolveKeyPath(id);
					path = bpId + '/' + keyPath;
					if (path !== id) multiItemValue = id.slice(path.length + 1);
				} else {
					keyPath = id.slice(bpId.length + 1);
				}
				meta = exports.businessProcessMetaMap[keyPath];
				if (meta) {
					if (meta.type && (meta.type !== 'direct')) return;
					if (multiItemValue && !meta.multiple) return;
					if (!meta.validate(record, multiItemValue)) return;
					meta.set(initBpDataset(bpId), record, multiItemValue);
				}
				var match = keyPath.match(re);
				if (!match) return;
				stepPath = match[1];
				if (!stepPaths.has(stepPath)) return;
				stepKeyPath = match[2];
				meta = exports.stepMetaMap[stepKeyPath];
				if (!meta) return;
				if (meta.type && (meta.type !== 'direct')) return;
				if (multiItemValue && !meta.multiple) return;
				if (!meta.validate(record, multiItemValue)) return;
				meta.set(initStepDataset(stepPath, bpId), record, multiItemValue);
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
	correctionTime: {
		validate: function (record) { return (record.value[0] === '2'); },
		set: function (data, record) { data.correctionTime = unserializeValue(record.value); },
		delete: function (data) { delete data.correctionTime; }
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
	},
	processingHolidaysTime: {
		validate: function (record) { return (record.value[0] === '2'); },
		set: function (data, record) { data.processingHolidaysTime = unserializeValue(record.value); },
		delete: function (data) { delete data.processingHolidaysTime; }
	},
	processor: {
		validate: function (record) { return (record.value[0] === '7'); },
		set: function (data, record) { data.processor = record.value.slice(1); },
		delete: function (data) { delete data.processor; }
	},
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
	}
};

exports.businessProcessMetaMap = {
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
	isDemo: {
		validate: function (record) { return (record.value === '11'); },
		set: function (data, record) { data.isDemo = true; },
		delete: function (data) { delete data.isDemo; }
	},
	isSubmitted: {
		validate: function (record) { return (record.value === '11'); },
		set: function (data, record) {
			data.submissionDateTime = new Date(record.stamp / 1000);
		},
		delete: function (data) { delete data.submissionDateTime; }
	},
	'registrations/requested': {
		type: 'computed',
		validate: function (record) { return record.value[0] === '['; },
		set: function (data, record) {
			data.registrations = new Set(resolveEventKeys(JSON.parse(record.value)).map(function (value) {
				return value.slice(value.lastIndexOf('/') + 1);
			}));
		},
		delete: function (data) { delete data.registrations; }
	},
	searchString: {
		type: 'computed',
		validate: function (record) { return record.value[0] === '3'; },
		set: function (data, record) { data.searchString = unserializeValue(record.value); },
		delete: function (data) { delete data.searchString; }
	},
	status: {
		type: 'computed',
		validate: function (record) { return (record.value[0] === '3'); },
		set: function (data, record) { data.status = record.value.slice(1); },
		delete: function (data) { delete data.status; }
	}
};
