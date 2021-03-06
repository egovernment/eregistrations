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
  , mano                          = require('mano')
  , mongoDB                       = require('../mongo-db')
  , debug                         = require('debug-ext')('status-history-logger')
  , deferred                      = require('deferred')
  , assign                        = require('es5-ext/object/assign');

var getPathSuffix = function () {
	return 'statusHistory/map/' + uniqIdPrefix + uuid();
};

var storeLog = function (storage, logPath/*, options */) {
	var options = Object(arguments[2]);
	return function (event) {
		var status, oldStatus, resolvedPath, logPathResolved, result;
		result = deferred(null);
		logPathResolved = logPath ? logPath + '/' + getPathSuffix() : getPathSuffix();

		if (event.type !== 'computed') return result;
		// We don't want to save null, as status is cardinalProperty of nested map and
		// needs to be set in order to avoid inconsistency with in memory engine
		status    = unserializeValue(event.data.value) || '';
		oldStatus = (event.old && unserializeValue(event.old.value)) || '';

		// We ignore such cases, they may happen when direct overwrites computed
		if (status === oldStatus) return result;
		result = {};
		return deferred(
			options.processorPath ? storage.get(event.ownerId + '/' +
					options.processorPath)(function (data) {
				if (data && data.value[0] === '7') {
					resolvedPath = event.ownerId + '/' + logPathResolved + '/processor';
					result.processorId = data.value.slice(1);
					return storage.store(resolvedPath, data.value);
				}
			}) : null,
			storage.store(event.ownerId + '/' + logPathResolved + '/status', serializeValue(status))
		).then(function () {
			result.ts                    = Math.round(event.data.stamp / 1000);
			result.status                = status;
			result.statusHistoryItemPath = logPathResolved;
			result.businessProcessId     = event.ownerId;

			return result;
		});
	};
};

var saveRejectionReason = function (event) {
	var status;
	if (event.type !== 'direct') return;
	if (!event.path.startsWith('processingSteps')) return;
	status = unserializeValue(event.data.value);
	if (status !== 'rejected' && status !== 'sentBack') return;
	if (!mano.queryMemoryDb) return;

	mano.queryMemoryDb([event.ownerId], 'businessProcessRejectionReasons', {
		businessProcessId: event.ownerId
	})(function (reasonObject) {
		return mongoDB.connect()(function (db) {
			var collection = db.collection('rejectionReasons');
			return collection.insertOne(reasonObject);
		});
	}).done(null, function (err) {
		console.error(err);
	});
};

var storeLogMongo = function (storeResult) {
	if (!mano.queryMemoryDb) return;
	return mano.queryMemoryDb([storeResult.businessProcessId],
		'processingStepStatusHistoryEntry',
		storeResult).then(function (processingStepLogData) {
		return mongoDB.connect().then(function (db) {
			var collection = db.collection('processingStepsHistory');
			debug('Will store log to mongo %s', JSON.stringify(processingStepLogData));
			return collection.insertOne(processingStepLogData);
		});
	}).done(null, function (err) {
		console.error(err);
	});
};

module.exports = exports = function () {
	var allStorages = new Set(), driver;

	// Cannot be initialized before call
	driver = mano.dbDriver;
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
				storeLog(storage, stepPath, { processorPath: stepPath + '/processor' })(event)
					.then(function (storeResult) {
						if (!storeResult) return deferred(null);
						return storeLogMongo(storeResult);
					});
				saveRejectionReason(event);
				exports.onProcessingStepStatusChange({ event: event, path: stepPath });
			});
		});
	});

	allStorages.forEach(function (storage) {
		storage.on('key:status', function (event) {
			storeLog(storage)(event).done();
		});
		db[capitalize.call(storage.name)].prototype.certificates.map.forEach(function (cert) {
			var certificatePath = 'certificates/map/' + cert.key;
			storage.on('key:' + certificatePath + '/status',
				function (event) {
					storeLog(storage, certificatePath)(event).done();
				});
		});
	});
};

exports.onProcessingStepStatusChange = function (data) {
	var event = data.event, status, oldStatus;

	if (event.type !== 'computed') return null;
	// We don't want to save null, as status is cardinalProperty of nested map and
	// needs to be set in order to avoid inconsistency with in memory engine
	status    = unserializeValue(event.data.value) || '';
	oldStatus = (event.old && unserializeValue(event.old.value)) || '';

	// We ignore such cases, they may happen when direct overwrites computed
	if (status === oldStatus) return null;

	return assign({}, data, { status: status, oldStatus: oldStatus });
};
