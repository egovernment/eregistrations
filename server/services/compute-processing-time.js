/**
 * Tracks processing steps status changes and updates processingTime and correctionTime props.
 * In other words, it calculates how long given businessProcess was being processed at given step
 * and how long the was it corrected by user.
 */

'use strict';

var resolveProcessingStepFullPath = require('../../utils/resolve-processing-step-full-path')
  , serializeValue                = require('dbjs/_setup/serialize/value')
  , unserializeValue              = require('dbjs/_setup/unserialize/value')
  , capitalize                    = require('es5-ext/string/#/capitalize');

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
			storage.on('key:' + stepPath + '/status', function (event) {
				var status, oldStatus, timePath;
				if (event.type !== 'computed' || !event.old) return;
				status    = unserializeValue(event.data.value);
				oldStatus = unserializeValue(event.old.value);
				// We ignore such cases, they may happen when direct overwrites computed
				if (status === oldStatus) return;
				if (status === 'approved' || status === 'rejected') {
					timePath = event.ownerId + '/' + stepPath + '/processingTime';
				}
				if (oldStatus === 'sentBack') {
					timePath = event.ownerId + '/' + stepPath + '/correctionTime';
				}
				if (!timePath) return;
				storage.get(timePath)(function (data) {
					var currentValue = 0;
					if (data && unserializeValue(data.value)) {
						currentValue = unserializeValue(data.value);
					}
					return storage.store(timePath,
						serializeValue(currentValue + ((event.data.stamp - event.old.stamp) / 1000)));
				}).done();
			});
		});
	});
};
