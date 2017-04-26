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

var rejectionItem = function (ownerType, types, value) {
	var reason = {};
	reason.types = typeof types === 'object' ? types : [];
	reason.value = value || '';
	reason.ownerType = ownerType || '';

	return reason;
};

var reasonObject = function (storage, event) {
	var reason      = {},
		path        = event.id.slice(0, event.id.indexOf('status')),
		userStorage = require('mano').dbDriver.getStorage('user'),
		prefix, otherValue;

	if (event.type !== 'direct') return;
	reason.hasOnlySystemicReasons = true;
	reason.rejectionType = unserializeValue(event.data.value);

	//rejectionReasons -> processingStep
	reason.rejectionReasons = [];
	if (reason.rejectionType === 'rejected') {
		reason.hasOnlySystemicReasons = false;
		storage.get(path + 'rejectionReason')(function (data) {
			if (!data || !data.value) return;
			otherValue = unserializeValue(data.value);
		});
		reason.rejectionReasons.push(rejectionItem('processingStep', ['other'], otherValue));
	}

	//rejectionReasons -> data
	storage.get(event.ownerId + '/dataForms/rejectReason')(function (data) {
		if (!data || !data.value) return;
		reason.hasOnlySystemicReasons = false;
		reason.rejectionReasons.push(rejectionItem('data', ['other'], unserializeValue(data.value)));
	});

	//rejectionReasons -> requirementUploads
	storage.getComputed(event.ownerId + '/requirementUploads/applicable')(function (data) {
		if (!data) return;
		var types, applicableRequirementUploads = data.value;
		applicableRequirementUploads.forEach(function (requirementUpload) {
			types = [];
			otherValue = '';
			if (!requirementUpload.hasOwnProperty('key')) return;
			prefix = requirementUpload.key.slice(1);
			storage.get(prefix + '/status')(function (upload) {
				if (!upload || !upload.value || unserializeValue(upload.value) !== 'invalid') return;
				storage.get(prefix + '/rejectReasonTypes*illegible')(function (type) {
					if (!type || !type.value || unserializeValue(type.value) !== true) return;
					types.push('illegible');
				});
				storage.get(prefix + '/rejectReasonTypes*invalid')(function (type) {
					if (!type || !type.value || unserializeValue(type.value) !== true) return;
					types.push('invalid');
				});
				storage.get(prefix + '/rejectReasonTypes*other')(function (type) {
					if (!type || !type.value || unserializeValue(type.value) !== true) return;
					reason.hasOnlySystemicReasons = false;
					types.push('other');
					storage.get(prefix + '/rejectReasonMemo')(function (memo) {
						if (!memo || !memo.value) return;
						otherValue = unserializeValue(memo.value);
					});
				});
				reason.rejectionReasons.push(rejectionItem('requirementUpload', types, otherValue));
			});
		});
	});

	//rejectionReasons -> paymentReceiptUploads
	storage.getComputed(event.ownerId + '/paymentReceiptUploads/applicable')(function (data) {
		if (!data) return;
		var types, applicablePaymentReceiptUploads = data.value;
		applicablePaymentReceiptUploads.forEach(function (paymentReceiptUpload) {
			types = [];
			otherValue = '';
			if (!paymentReceiptUpload.hasOwnProperty('key')) return;
			prefix = paymentReceiptUpload.key.slice(1);
			storage.get(prefix + '/status')(function (upload) {
				if (!upload || !upload.value || unserializeValue(upload.value) !== 'invalid') return;
				reason.hasOnlySystemicReasons = false;
				types.push('other');
				storage.get(prefix + '/rejectReasonMemo')(
					function (rejectReasonMemo) {
						if (!rejectReasonMemo || !rejectReasonMemo.value) return;
						otherValue = unserializeValue(rejectReasonMemo.value);
					}
				);
				reason.rejectionReasons.push(rejectionItem('paymentReceipt', types, otherValue));
			});
		});
	});

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
		reason.operator.id = data.value.slice(1);
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
	reason.date = Math.round(event.data.stamp / 1000);

	return reason;
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
				storeLog(storage, certificatePath));
		});
	});
};
