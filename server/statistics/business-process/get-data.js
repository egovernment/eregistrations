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
  , resolveProcessingStepFullPath = require('../../../utils/resolve-processing-step-full-path')
  , toDateInTz                    = require('../../../utils/to-date-in-time-zone')
  , timeZone                      = require('../../../db').timeZone;

var re = new RegExp('^([0-9a-z]+)\\/processingSteps\\/map\\/([a-zA-Z0-9]+' +
	'(?:\\/steps\\/map\\/[a-zA-Z0-9]+)*)\\/([a-z0-9A-Z\\/]+)$');

module.exports = memoize(function (driver, processingStepsMeta) {
	var result = Object.create(null), storageStepsMap = new Map(), stepShortPathMap = new Map()
	  , serviceFullShortNameMap = new Map();

	forEach(processingStepsMeta, function (meta, stepShortPath) {
		var stepPath = resolveProcessingStepFullPath(stepShortPath);
		stepShortPathMap.set(stepPath, stepShortPath);
		meta._services.forEach(function (serviceName) {
			var serviceFullName = 'businessProcess' + capitalize.call(serviceName)
			  , storage = driver.getStorage(serviceFullName);
			serviceFullShortNameMap.set(serviceFullName, serviceName);
			if (!storageStepsMap.has(storage)) storageStepsMap.set(storage, new Set());
			storageStepsMap.get(storage).add(stepPath);
			storage.on('key:processingSteps/map/' + stepPath + '/status', function (event) {
				if (event.type !== 'direct') return;
				if ((event.data.value !== '3approved') && (event.data.value !== '3rejected')) {
					if (!result[stepShortPath]) return;
					delete result[stepShortPath][event.ownerId];
				} else {
					if (!result[stepShortPath]) result[stepShortPath] = Object.create(null);
					result[stepShortPath][event.ownerId] = {
						businessProcessId: event.ownerId,
						data: event.data,
						date: toDateInTz(new Date(event.data.stamp / 1000), timeZone),
						stepFullPath: 'processingSteps/map/' + stepPath,
						serviceName: serviceName,
						storage: storage
					};
				}
			});
		});
	});

	return deferred.map(aFrom(storageStepsMap), function (data) {
		var storage = data[0], stepPaths = data[1]
		  , serviceName = serviceFullShortNameMap.get(storage.name);
		return storage.search(function (id, record) {
			var match = id.match(re), businessProcessId, stepPath, stepShortPath;
			if (!match) return;
			stepPath = match[2];
			if (!stepPaths.has(stepPath)) return;
			if (match[3] !== 'status') return;
			if ((record.value !== '3approved') && (record.value !== '3rejected')) return;
			businessProcessId = match[1];
			stepShortPath = stepShortPathMap.get(stepPath);
			if (!result[stepShortPath]) result[stepShortPath] = Object.create(null);
			result[stepShortPath][businessProcessId] = {
				businessProcessId: businessProcessId,
				data: record,
				date: toDateInTz(new Date(record.stamp / 1000), timeZone),
				stepFullPath: 'processingSteps/map/' + stepPath,
				serviceName: serviceName,
				storage: storage
			};
		});
	})(result);

}, { length: 0 });
