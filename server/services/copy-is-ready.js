/**
	* Tracks processing steps status changes and updates direct isReady.
	* It's needed to maintain desired isReady's stamp.
	* This service is complementary to business-process-flow
*/

'use strict';

var aFrom                         = require('es5-ext/array/from')
  , capitalize                    = require('es5-ext/string/#/capitalize')
  , Map                           = require('es6-map')
  , Set                           = require('es6-set')
  , deferred                      = require('deferred')
  , debug                         = require('debug-ext')('business-process-flow')
  , resolveProcessingStepFullPath = require('../../utils/resolve-processing-step-full-path');

var copyIsReady = function (storage, stepId) {
	var isReadyPath = stepId + '/isReady';
	return storage.get(isReadyPath)(function (record) {
		if (record && (record.value[0] === '1')) return;
		return storage.getComputed(isReadyPath)(function (computedRecord) {
			if (!computedRecord || (computedRecord.value !== '11')) {
				console.error("\nUnexpected isReady value for" + isReadyPath + "\n");
				console.log("Direct record", record);
				console.log("Computed record", computedRecord);
				return;
			}
			var shortPath = stepId.split('/map/').slice(1).map(function (part) {
				return part.replace(/\/steps$/, '');
			}).join('/');
			debug('%s %s step shadow isReady', stepId.split('/', 1)[0], shortPath);
			return storage.store(isReadyPath, computedRecord.value, computedRecord.stamp);
		});
	});
};

module.exports = function (driver, processingStepsMeta) {
	var storageStepMap = new Map();
	Object.keys(processingStepsMeta).forEach(function (stepMetaKey) {
		var stepPath = 'processingSteps/map/' + resolveProcessingStepFullPath(stepMetaKey);
		processingStepsMeta[stepMetaKey]._services.forEach(function (serviceName) {
			var storage = driver.getStorage('businessProcess' + capitalize.call(serviceName));
			if (!storageStepMap.has(storage)) storageStepMap.set(storage, new Set());
			storageStepMap.get(storage).add(stepPath);
		});
	});
	deferred.map(aFrom(storageStepMap), function (data) {
		var storage = data[0], stepPaths = data[1];
		stepPaths.forEach(function (stepPath) {
			storage.on('key:' + stepPath + '/status', function (event) {
				if (event.type !== 'direct') return;
				if (event.data.value[0] !== '3') return;
				copyIsReady(storage, event.ownerId + '/' + stepPath).done();
			});
		});
		var statusPaths = new Set(aFrom(stepPaths).map(function (stepPath) {
			return stepPath + '/status';
		}));
		return storage.search(function (id, data) {
			var index = id.indexOf('/');
			if (index === -1) return;
			if (!statusPaths.has(id.slice(index + 1))) return;
			if (data.value[0] !== '3') return;
			return copyIsReady(storage, id.slice(0, -'/status'.length));
		});
	}).done();
};
