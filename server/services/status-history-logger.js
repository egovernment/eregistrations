'use strict';

var resolveProcessingStepFullPath = require('../../utils/resolve-processing-step-full-path')
  , serializeValue                = require('dbjs/_setup/serialize/value')
  , unserializeValue              = require('dbjs/_setup/unserialize/value')
  , capitalize                    = require('es5-ext/string/#/capitalize')
  , db                            = require('../../db')
  , Set                           = require('es6-set')
  , processingStepsMeta           = require('../../processing-steps-meta')
  , uuid                          = require('time-uuid')
  , uniqIdPrefix                  = 'abcdefghiklmnopqrstuvxyz'[Math.floor(Math.random() * 24)]
  , queryMemoryDb                 = require('mano').queryMemoryDb
  , mongoDB                       = require('../mongo-db');

var getPathSuffix = function () {
	return 'statusHistory/map/' + uniqIdPrefix + uuid();
};

var storeLog = function (storage, logPath/*, options */) {
	var options = Object(arguments[2]);
	return function (event) {
		var status, oldStatus, resolvedPath, logPathResolved;
		logPathResolved = logPath ? logPath + '/' + getPathSuffix() : getPathSuffix();

		if (event.type !== 'computed') return;
		// We don't want to save null, as status is cardinalProperty of nested map and
		// needs to be set in order to avoid inconsistency with in memory engine
		status    = unserializeValue(event.data.value) || '';
		oldStatus = (event.old && unserializeValue(event.old.value)) || '';

		// We ignore such cases, they may happen when direct overwrites computed
		if (status === oldStatus) return;
		if (options.processorPath) {
			storage.get(event.ownerId + '/' + options.processorPath)(function (data) {
				if (data && data.value[0] === '7') {
					resolvedPath = event.ownerId + '/' + logPathResolved + '/processor';
					return storage.store(resolvedPath, data.value);
				}
			}).done();
		}
		resolvedPath = event.ownerId + '/' + logPathResolved + '/status';
		storage.store(resolvedPath, serializeValue(status)).done();
	};
};

var saveRejectionReason = function (event) {
	var status;
	if (event.type !== 'direct') return;
	if (!event.path.startsWith('processingSteps')) return;
	status = unserializeValue(event.data.value);
	if (status !== 'rejected' && status !== 'sentBack') return;

	return queryMemoryDb([event.ownerId], 'businessProcessRejectionReasons', {
		businessProcessId: event.ownerId
	})(function (reasonObject) {
		return mongoDB()(function (db) {
			var collection = db.collection('rejectionReasons');
			return collection.insertOne(reasonObject);
		});
	}).done(null, function (err) {
		console.error(err);
	});
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
			storage.on('key:' + stepPath + '/status', function (event) {
				storeLog(storage, stepPath, { processorPath: stepPath + '/processor' })(event);
				saveRejectionReason(event);
			});
		});
	});

	allStorages.forEach(function (storage) {
		storage.on('key:status', storeLog(storage));
		db[capitalize.call(storage.name)].prototype.certificates.map.forEach(function (cert) {
			var certificatePath = 'certificates/map/' + cert.key;
			storage.on('key:' + certificatePath + '/status',
				storeLog(storage, certificatePath));
		});
	});
};
