// Retrive data for all steps of all files
// (map db data into meta objects for our needs)

'use strict';

var aFrom                         = require('es5-ext/array/from')
  , forEach                       = require('es5-ext/object/for-each')
  , ensureCallable                = require('es5-ext/object/valid-callable')
  , capitalize                    = require('es5-ext/string/#/capitalize')
  , Set                           = require('es6-set')
  , Map                           = require('es6-map')
  , deferred                      = require('deferred')
  , memoize                       = require('memoizee')
  , unserializeValue              = require('dbjs/_setup/unserialize/value')
  , resolveProcessingStepFullPath = require('../../../utils/resolve-processing-step-full-path')
  , toDateInTz                    = require('../../../utils/to-date-in-time-zone')
  , timeZone                      = require('../../../db').timeZone;

var re = new RegExp('^([0-9a-z]+)\\/processingSteps\\/map\\/([a-zA-Z0-9]+' +
	'(?:\\/steps\\/map\\/[a-zA-Z0-9]+)*)\\/([a-z0-9A-Z\\/]+)$');

module.exports = memoize(function (driver, processingStepsMeta/*, options*/) {
	var storageStepsMap = new Map(), stepShortPathMap = new Map()
	  , serviceFullShortNameMap = new Map(), options = Object(arguments[2])
	  , customStorageSetup;

	if (options.storageSetup) customStorageSetup = ensureCallable(options.storageSetup);

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
	});

	// Map of all properties to be mapped to result with corresponding instructions
	var stepMetaMap = {
		status: {
			validate: function (record) {
				return ((record.value === '3approved') || (record.value === '3rejected'));
			},
			set: function (data, record) {
				data.processingDate = toDateInTz(new Date(record.stamp / 1000), timeZone);
			},
			delete: function (data) { delete data.processingDate; }
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
		processingTime: {
			validate: function (record) { return (record.value[0] === '2'); },
			set: function (data, record) { data.processingTime = unserializeValue(record.value); },
			delete: function (data) { delete data.processingTime; }
		}
	};

	return deferred.map(aFrom(storageStepsMap), function (data) {
		var storage = data[0], stepPaths = data[1], customRecordSetup
		  , serviceName = serviceFullShortNameMap.get(storage.name);

		var initStepDataset = function (stepPath, businessProcessId) {
			var stepShortPath = stepShortPathMap.get(stepPath);
			if (!result.steps[stepShortPath]) result.steps[stepShortPath] = Object.create(null);
			if (!result.steps[stepShortPath][businessProcessId]) {
				result.steps[stepShortPath][businessProcessId] = {
					businessProcessId: businessProcessId,
					stepFullPath: 'processingSteps/map/' + stepPath,
					serviceName: serviceName,
					storage: storage
				};
			}
			return result.steps[stepShortPath][businessProcessId];
		};

		// Listen for new records
		stepPaths.forEach(function (stepPath) {
			// Status
			forEach(stepMetaMap, function (stepKeyPath, meta) {
				storage.on('key:processingSteps/map/' + stepPath + '/' + stepKeyPath, function (event) {
					if (event.type !== 'direct') return;
					if (!meta.validate(event.data)) meta.delete(initStepDataset(stepPath, event.ownerId));
					else meta.set(initStepDataset(stepPath, event.ownerId), event.data);
				});
			});
		});
		if (customStorageSetup) {
			customRecordSetup = customStorageSetup(storage, {
				stepPaths: stepPaths,
				stepShortPathMap: stepShortPathMap,
				serviceName: serviceName,
				initStepDataset: initStepDataset
			});
			if (customRecordSetup) ensureCallable(customRecordSetup);
		}

		// Get current records
		return storage.search(function (id, record) {
			var index = id.indexOf('/'), businessProcessId, stepPath, stepKeyPath, meta;
			if (customRecordSetup) customRecordSetup(id, record);
			if (index === -1) return;
			var match = id.match(re);
			if (!match) return;
			stepPath = match[2];
			if (!stepPaths.has(stepPath)) return;
			stepKeyPath = match[3];
			meta = stepMetaMap[stepKeyPath];
			if (!meta) return;
			businessProcessId = match[1];
			if (!meta.validate(record)) return;
			meta.set(initStepDataset(stepPath, businessProcessId), record);
		});
	})(result);

}, { length: 0 });
