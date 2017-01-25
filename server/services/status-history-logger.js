'use strict';

var resolveProcessingStepFullPath = require('../../utils/resolve-processing-step-full-path')
  , serializeValue                = require('dbjs/_setup/serialize/value')
  , unserializeValue              = require('dbjs/_setup/unserialize/value')
  , capitalize                    = require('es5-ext/string/#/capitalize')
  , db                            = require('../../db')
  , Set                           = require('es6-set')
  , processingStepsMeta           = require('../../processing-steps-meta')
  , driver                        = require('mano').dbDriver
  , uuid                          = require('time-uuid')
  , uniqIdPrefix                  = 'abcdefghiklmnopqrstuvxyz'[Math.floor(Math.random() * 24)];

var storeLog = function (storage, logPath) {
	return function (event) {
		var status, oldStatus;

		if (event.type !== 'computed' || !event.old) return;
		status    = unserializeValue(event.data.value);
		oldStatus = unserializeValue(event.old.value);

		// We ignore such cases, they may happen when direct overwrites computed
		if (status === oldStatus) return;
		storage.store(logPath, serializeValue(status));
	};
};

module.exports = function () {
	var allStorages = new Set();
	Object.keys(processingStepsMeta).forEach(function (stepMetaKey) {
		var stepPath, storages;
		stepPath = 'processingSteps/map/' + resolveProcessingStepFullPath(stepMetaKey);
		storages = processingStepsMeta[stepMetaKey]._services;
		if (!storages) throw new Error("Storages must be set");
		storages = storages.map(function (storageName) {
			return driver.getStorage('businessProcess' + capitalize.call(storageName));
		});
		storages.forEach(function (storage) {
			allStorages.add(storage);
			storage.on('key:' + stepPath + '/status',
				storeLog(stepPath + '/statusHistory/map/' + uniqIdPrefix + uuid() + '/status')
				);
		});
		allStorages.forEach(function (storage) {
			storage.on('key:status', storeLog(storage, 'statusHistory/map/' +
				uniqIdPrefix + uuid() + '/status'));

			db[capitalize.call(storage)].prototype.certificates.map.forEach(function (cert) {
				var certificatePath = 'certificates/map/' + cert.key;
				storage.on('key:status', storeLog(storage, certificatePath + '/statusHistory/map/' +
					uniqIdPrefix + uuid() + '/status'));
			});
		});
	});
};
