/**
 * Tracks processing steps status changes and updates direct isReady.
 * It's needed to maintain desired isReady's stamp.
 */

'use strict';

var resolveProcessingStepFullPath = require('../../utils/resolve-processing-step-full-path')
  , unserializeValue              = require('dbjs/_setup/unserialize/value')
  , driver                        = require('mano').dbDriver
  , capitalize                    = require('es5-ext/string/#/capitalize');

var getCopyIsReady = function (storage, stepPath) {
	return function (event) {
		var status, isReadyPath = event.ownerId + '/' + stepPath + '/isReady';
		if (event.type === 'computed') return;
		status = unserializeValue(event.data.value);
		if (status == null) return;

		storage.get(isReadyPath)(function (directIsReady) {
			if (!directIsReady || (unserializeValue(directIsReady.data.value) == null)) {
				return storage.getComputed(isReadyPath)(function (computedIsReady) {
					storage.store(isReadyPath, computedIsReady.data.value, computedIsReady.data.stamp);
				});
			}
		}).done();
	};
};

module.exports = function (processingStepsMeta) {
	Object.keys(processingStepsMeta).forEach(function (stepMetaKey) {
		var stepPath, storages;
		stepPath = 'processingSteps/map/' + resolveProcessingStepFullPath(stepMetaKey);
		storages = processingStepsMeta[stepMetaKey]._services;
		if (!storages) throw new Error("Storages must be set");
		storages = storages.map(function (storageName) {
			return driver.getStorage('businessProcess' + capitalize.call(storageName));
		});
		storages.forEach(function (storage) {
			var copyIsReady = getCopyIsReady(storage, stepPath);
			storage.on('key:' + stepPath + '/status', copyIsReady);
			copyIsReady();
		});
	});
};
