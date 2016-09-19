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
  , resolveProcessingStepFullPath = require('../../../utils/resolve-processing-step-full-path')
  , toDateInTz                    = require('../../../utils/to-date-in-time-zone')
  , timeZone                      = require('../../../db').timeZone;

var re = new RegExp('^([0-9a-z]+)\\/processingSteps\\/map\\/([a-zA-Z0-9]+' +
	'(?:\\/steps\\/map\\/[a-zA-Z0-9]+)*)\\/([a-z0-9A-Z\\/]+)$');

module.exports = memoize(function (driver, processingStepsMeta/*, options*/) {
	var result = Object.create(null), storageStepsMap = new Map(), stepShortPathMap = new Map()
	  , serviceFullShortNameMap = new Map(), options = Object(arguments[2])
	  , customStorageSetup;

	if (options.storageSetup) customStorageSetup = ensureCallable(options.storageSetup);

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

	return deferred.map(aFrom(storageStepsMap), function (data) {
		var storage = data[0], stepPaths = data[1], customRecordSetup
		  , serviceName = serviceFullShortNameMap.get(storage.name);

		var initDataset = function (stepPath, businessProcessId) {
			var stepShortPath = stepShortPathMap.get(stepPath);
			if (!result[stepShortPath]) result[stepShortPath] = Object.create(null);
			if (!result[stepShortPath][businessProcessId]) {
				result[stepShortPath][businessProcessId] = {
					businessProcessId: businessProcessId,
					stepFullPath: 'processingSteps/map/' + stepPath,
					serviceName: serviceName,
					storage: storage
				};
			}
			return result[stepShortPath][businessProcessId];
		};

		// Listen for new records
		stepPaths.forEach(function (stepPath) {
			var stepShortPath = stepShortPathMap.get(stepPath);

			// Status
			storage.on('key:processingSteps/map/' + stepPath + '/status', function (event) {
				var data;
				if (event.type !== 'direct') return;
				if ((event.data.value !== '3approved') && (event.data.value !== '3rejected')) {
					data = initDataset(stepShortPath, event.ownerId);
					delete data.processingDate;
				} else {
					data = initDataset(stepShortPath, event.ownerId);
					data.processingDate = toDateInTz(new Date(event.data.stamp / 1000), timeZone);
				}
			});

			// Processor
			storage.on('key:processingSteps/map/' + stepPath + '/processor', function (event) {
				var data;
				if (event.type !== 'direct') return;
				if (event.data.value[0] !== '7') {
					data = initDataset(stepShortPath, event.ownerId);
					delete data.processor;
				} else {
					data = initDataset(stepShortPath, event.ownerId);
					data.processor = event.data.value.slice(1);
				}
			});
		});
		if (customStorageSetup) {
			customRecordSetup = customStorageSetup(storage, {
				stepPaths: stepPaths,
				stepShortPathMap: stepShortPathMap,
				serviceName: serviceName,
				initDataset: initDataset
			});
			if (customRecordSetup) ensureCallable(customRecordSetup);
		}

		// Get current records
		return storage.search(function (id, record) {
			var match = id.match(re), businessProcessId, stepPath, keyPath, data;
			if (customRecordSetup) customRecordSetup(id, record);
			if (!match) return;
			stepPath = match[2];
			if (!stepPaths.has(stepPath)) return;
			businessProcessId = match[1];
			keyPath = match[3];

			// Status
			if (keyPath === 'status') {
				if ((record.value !== '3approved') && (record.value !== '3rejected')) return;
				data = initDataset(stepPath, businessProcessId);
				data.processingDate = toDateInTz(new Date(record.stamp / 1000), timeZone);

			// Processor
			} else if (keyPath === 'processor') {
				if (record.value[0] !== '7') return;
				data.processor = record.value.slice(1);
			}
		});
	})(result);

}, { length: 0 });
