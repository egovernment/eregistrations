'use strict';

var resolveProcessingStepFullPath = require('../../utils/resolve-processing-step-full-path')
  , serializeValue                = require('dbjs/_setup/serialize/value')
  , unserializeValue              = require('dbjs/_setup/unserialize/value')
  , capitalize                    = require('es5-ext/string/#/capitalize')
  , debug                         = require('debug-ext')('status-history-logger')
  , db                            = require('../../db')
  , Set                           = require('es6-set')
  , processingStepsMeta           = require('../../processing-steps-meta')
  , uuid                          = require('time-uuid')
  , uniqIdPrefix                  = 'abcdefghiklmnopqrstuvxyz'[Math.floor(Math.random() * 24)];

var storeLog = function (storage, logPath/* options */) {
	return function (event) {
		var status, oldStatus, options;
		options = Object(arguments[2]);

		if (event.type !== 'computed') return;
		status    = unserializeValue(event.data.value) || null;
		oldStatus = (event.old && unserializeValue(event.old.value)) || null;

		// We ignore such cases, they may happen when direct overwrites computed
		if (status === oldStatus) return;
		if (options.processorPath) {
			storage.get(options.processorPath)(function (data) {
				if (data && data.value[0] === '7') {
					storage.store(logPath + '/processor', data.value);
					debug('Stored priocessor %s for the path %s', data.value, logPath + '/processor');
				}
			});
		}
		storage.store(logPath + '/status', serializeValue(status));
		debug('Stored status %s for the path %s', status, logPath + '/status');
	};
};

var getPathSuffix = function () {
	return '/statusHistory/map/' + uniqIdPrefix + uuid();
};

module.exports = function () {
	var allStorages = new Set(), driver;
	// Cannot be initialized before call
	driver = require('mano').dbDriver;
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
				storeLog(storage, stepPath + getPathSuffix(), { processorPath: stepPath + '/processor' })
				);
		});
	});
	allStorages.forEach(function (storage) {
		storage.on('key:status', storeLog(storage, getPathSuffix()));
		db[capitalize.call(storage.name)].prototype.certificates.map.forEach(function (cert) {
			var certificatePath = 'certificates/map/' + cert.key;
			storage.on('key:' + certificatePath + '/status',
				storeLog(storage, certificatePath + getPathSuffix()));
		});
	});
};
