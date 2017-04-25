'use strict';

var resolveProcessingStepFullPath = require('../../utils/resolve-processing-step-full-path')
	, serializeValue                = require('dbjs/_setup/serialize/value')
	, unserializeValue              = require('dbjs/_setup/unserialize/value')
	, capitalize                    = require('es5-ext/string/#/capitalize')
	, db                            = require('../../db')
	, Set                           = require('es6-set')
	, processingStepsMeta           = require('../../processing-steps-meta')
	, uuid                          = require('time-uuid')
	, uniqIdPrefix                  = 'abcdefghiklmnopqrstuvxyz'[Math.floor(Math.random() * 24)];

var getPathSuffix = function () {
	return 'statusHistory/map/' + uniqIdPrefix + uuid();
};

var storeLog = function (storage, logPath/*, options */) {
	var options = Object(arguments[2]);
	return function (event) {
		var status, oldStatus, resolvedPath, logPathResolved;
		logPathResolved = logPath ? logPath + '/' + getPathSuffix() : getPathSuffix();
		if (event.type === 'direct' && logPathResolved.startsWith('processingSteps')) {
			console.log(JSON.stringify(reasonObject(storage, event)));
		}
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

var reasonObject = function (storage, event) {

	var reason = {}, rejectionReason = {},
		path = event.id.slice(0, event.id.indexOf('status')),
		userStorage = require('mano').dbDriver.getStorage('user');

	if (event.type !== 'direct') return;
	reason.hasOnlySystemicReasons = true;
	reason.rejectionType = unserializeValue(event.data.value);

	//rejectionReasons -> processingStep
	reason.rejectionReasons = [];
	if (reason.rejectionType === 'rejected') {
		reason.hasOnlySystemicReasons = false;

		rejectionReason = {};
		rejectionReason.types = ['other'];
		storage.get(path + 'rejectionReason')(function (data) {
			if (!data || !data.value) return;
			rejectionReason.value = unserializeValue(data.value);
		});
		rejectionReason.ownerType = 'processingStep';
		reason.rejectionReasons.push(rejectionReason);
	}
	//rejectionReasons -> data
	storage.get(event.ownerId + '/dataForms/rejectReason')(function (data) {
		if (!data || !data.value) return;
		reason.hasOnlySystemicReasons = false;
		rejectionReason = {};
		rejectionReason.types = ['other'];
		rejectionReason.value = unserializeValue(data.value);
		rejectionReason.ownerType = 'data';
		reason.rejectionReasons.push(rejectionReason);
	});
	//rejectionReasons -> requirementUploads TODO
	storage.getComputed(event.ownerId + '/requirementUploads/applicable')(function (data) {
		//if (!data || !data.value) return;
		console.log("requirementUploads applicable data is", data);
		reason.service.businessName = unserializeValue(data.value);
	});
//	storage.search({ keyPath: 'requirementUploads/' }, function (id, data) {
//		console.log('storage search');
//		console.log('getAllObjectalgab  id on ', id);
//		console.log('getAllObjectalgab  data on ', data);
//		data.forEach(function (object) {
//			console.log(object);
//		});
//	});

	//service
	reason.service = {};
	reason.service.type = capitalize.call(storage.name);
	reason.service.id = event.ownerId;
	storage.getComputed(event.ownerId + '/businessName')(function (data) {
		if (!data || !data.value) return;
		reason.service.businessName = unserializeValue(data.value);
	});

	//operator
	reason.operator = {};
	storage.get(path + 'processor')(function (data) {
		if (!data || !data.value) return;
		reason.operator.id = unserializeValue(data.value);
		userStorage.getComputed(reason.operator.id + '/fullName')(function (data) {
			if (!data || !data.value) return;
			reason.operator.name = unserializeValue(data.value);
		});
	});


	//processingStep
	reason.processingStep = {};
	reason.processingStep.path = '/' + event.path.slice(0, event.path.indexOf('status') - 1);
	reason.processingStep.label = capitalize.call(reason.processingStep.path.slice(
		reason.processingStep.path.lastIndexOf('/') + 1
	));
	reason.date = event.data.stamp;
	return reason;
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
				storeLog(storage, stepPath, { processorPath: stepPath + '/processor' })
			);
		});
	});
	allStorages.forEach(function (storage) {
		storage.on('key:status', storeLog(storage));
		db[capitalize.call(storage.name)].prototype.certificates.map.forEach(function (cert) {
			var certificatePath = 'certificates/map/' + cert.key;
			storage.on('key:' + certificatePath + '/status',
				storeLog(storage, certificatePath));//
		});
	});
};

