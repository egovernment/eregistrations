/**
 * Tracks processing steps status changes and updates direct isReady.
 * It's needed to maintain desired isReady's stamp.
 * This service is complementary to business-process-flow
 */

'use strict';

var resolveProcessingStepFullPath = require('../../utils/resolve-processing-step-full-path')
  , unserializeValue              = require('dbjs/_setup/unserialize/value')
  , deferred                      = require('deferred')
  , capitalize                    = require('es5-ext/string/#/capitalize')
  , ensureArray                   = require('es5-ext/array/valid-array')
  , emptyPromise                  = deferred(null);

var getCopyIsReady = function (storage) {
	return function (isReadyPath, status) {
		status = unserializeValue(status);
		if (status == null) return emptyPromise;

		return storage.get(isReadyPath)(function (directIsReady) {
			if ((directIsReady == null) || (unserializeValue(directIsReady.value) == null)) {
				return storage.getComputed(isReadyPath)(function (computedIsReady) {
					return storage.store(isReadyPath, computedIsReady.value, computedIsReady.stamp);
				});
			}
			return emptyPromise;
		});
	};
};

module.exports = function (driver, processingStepsMeta) {
	Object.keys(processingStepsMeta).forEach(function (stepMetaKey) {
		var stepPath, storages;
		stepPath = 'processingSteps/map/' + resolveProcessingStepFullPath(stepMetaKey);
		storages = ensureArray(processingStepsMeta[stepMetaKey]._services);
		storages = storages.map(function (storageName) {
			return driver.getStorage('businessProcess' + capitalize.call(storageName));
		});
		storages.forEach(function (storage) {
			var copyIsReady = getCopyIsReady(storage);
			storage.on('key:' + stepPath + '/status', function (event) {
				var isReadyPath = event.ownerId + '/' + stepPath + '/isReady';
				if (event.type === 'computed') return;
				copyIsReady(isReadyPath, event.data.value).done();
			});
			storage.search({ keyPath: stepPath + '/status' }, function (id, data) {
				return copyIsReady(id.split('/', 1)[0] + '/' + stepPath + '/isReady', data.value);
			}).done();
		});
	});
};
