/**
 * Tracks processing steps status changes and updates direct isReady.
 * It's needed to maintain desired isReady's stamp.
 * This service is complementary to business-process-flow
 */

'use strict';

var resolveProcessingStepFullPath = require('../../utils/resolve-processing-step-full-path')
  , unserializeValue              = require('dbjs/_setup/unserialize/value')
  , capitalize                    = require('es5-ext/string/#/capitalize');

var getCopyIsReady = function (storage) {
	return function (isReadyPath, status) {
		status = unserializeValue(status);
		if (status == null) return;

		storage.get(isReadyPath)(function (directIsReady) {
			if ((directIsReady == null) || (unserializeValue(directIsReady.value) == null)) {
				return storage.getComputed(isReadyPath)(function (computedIsReady) {
					storage.store(isReadyPath, computedIsReady.value, computedIsReady.stamp);
				});
			}
		}).done();
	};
};

module.exports = function (driver, processingStepsMeta) {
	Object.keys(processingStepsMeta).forEach(function (stepMetaKey) {
		var stepPath, storages;
		stepPath = 'processingSteps/map/' + resolveProcessingStepFullPath(stepMetaKey);
		storages = processingStepsMeta[stepMetaKey]._services;
		if (!storages) throw new Error("Storages must be set");
		storages = storages.map(function (storageName) {
			return driver.getStorage('businessProcess' + capitalize.call(storageName));
		});
		storages.forEach(function (storage) {
			var copyIsReady = getCopyIsReady(storage);
			storage.on('key:' + stepPath + '/status', function (event) {
				var isReadyPath = event.ownerId + '/' + stepPath + '/isReady';
				if (event.type === 'computed') return;
				copyIsReady(isReadyPath, event.data.value);
			});
			storage.search({ keyPath: stepPath + '/status' }, function (id, data) {
				copyIsReady(id.split('/', 1)[0] + '/' + stepPath + '/isReady', data.value);
			});
		});
	});
};
