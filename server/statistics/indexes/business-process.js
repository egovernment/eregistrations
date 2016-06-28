'use strict';

var includes            = require('es5-ext/array/#/contains')
  , forEach             = require('es5-ext/object/for-each')
  , ensureObject        = require('es5-ext/object/valid-object')
  , uncapitalize        = require('es5-ext/string/#/uncapitalize')
  , ensureType          = require('dbjs/valid-dbjs-type')
  , ensureStorage       = require('dbjs-persistence/ensure-storage')
  , resolveInstances    = require('../../../business-processes/resolve')
  , resolveFullStepPath = require('../../../utils/resolve-processing-step-full-path')

  , isBusinessProcessType = RegExp.prototype.test.bind(/^BusinessProcess[A-Z]/);

module.exports = function (type, data) {
	ensureType(type);
	if (!isBusinessProcessType(type.__id__)) {
		throw new TypeError("Expected BusinessProcess type, but got " + type.__id__);
	}
	ensureObject(data);

	var storage = ensureStorage(data.storage)
	  , processingStepsMap = ensureObject(data.processingStepsMap)
	  , serviceName = uncapitalize.call(type.__id__.slice('BusinessProcess'.length))
	  , ns = 'statistics/businessProcess/' + serviceName + '/'
	  , instances = resolveInstances(type)
	  , atPartA = instances.filterByKey('isSubmitted', false)
	  , afterPartA = instances.filterByKey('isSubmitted', true)
	  , atPartB = afterPartA.filterByKey('isClosed', false);

	// atPartA
	var currentNs = ns + 'atPartA/';
	storage.trackCollectionSize(currentNs + 'all', atPartA);

	// Guide incomplete
	storage.trackCollectionSize(currentNs + 'atGuide',
		atPartA.filterByKey('guideProgress', function (progress) { return progress < 1; }));

	// Guide complete
	currentNs += 'guideComplete/';
	var guideComplete = atPartA.filterByKey('guideProgress', 1);
	storage.trackCollectionSize(currentNs + 'all', guideComplete);

	// Guide & Forms complete
	var dataFormsComplete = guideComplete.filterByKeyPath('dataForms/progress', 1);
	storage.trackCollectionSize(currentNs + 'dataFormsComplete', dataFormsComplete);

	// Guide & Documents complete
	var requirementUploadsComplete =
		guideComplete.filterByKeyPath('requirementUploads/progress', 1);
	storage.trackCollectionSize(currentNs + 'requirementUploadsComplete', requirementUploadsComplete);

	// Guide & Forms & Payment complete (at send page)
	var paymentComplete = guideComplete.filterByKeyPath('costs/paymentProgress', 1);
	storage.trackCollectionSize(currentNs + 'paymentComplete', paymentComplete);

	// At send
	storage.trackCollectionSize(currentNs + 'atSend', dataFormsComplete
		.filterByKeyPath('requirementUploads/progress', 1).filterByKeyPath('costs/paymentProgress', 1));

	// At Part B
	storage.trackCollectionSize(ns + 'pending', atPartB);

	// Each processing step
	forEach(processingStepsMap, function (meta, path) {
		if (!includes.call(meta._services, serviceName)) return;
		var keyPath = 'processingSteps/map/' + resolveFullStepPath(path) + '/';

		currentNs = ns + 'atPartB/' + path + '/';

		// Pending
		storage.trackCollectionSize(currentNs + 'pending',
			atPartB.filterByKeyPath(keyPath + 'isPending', true));

		// Sent back
		if (meta.sentBack) {
			storage.trackCollectionSize(currentNs + 'sentBack',
				atPartB.filterByKeyPath(keyPath + 'isSentBack', true));
		}

		// Redelegated
		if (meta.redelegated) {
			storage.trackCollectionSize(currentNs + 'redelegated',
				atPartB.filterByKeyPath(keyPath + 'isRedelegated', true));
		}

		// Rejected
		if (meta.rejected) {
			storage.trackCollectionSize(currentNs + 'rejected',
				afterPartA.filterByKeyPath(keyPath + 'isRejected', true));
		}

		// Approved
		storage.trackCollectionSize(currentNs + 'approved',
			atPartB.filterByKeyPath(keyPath + 'isApproved', true));
	});

	// Overall statuses
	// All SentBack
	storage.trackCollectionSize(ns + 'sentBack', afterPartA.filterByKey('isSentBack', true));

	// All Rejected
	storage.trackCollectionSize(ns + 'rejected', afterPartA.filterByKey('isRejected', true));

	// All Approved
	storage.trackCollectionSize(ns + 'approved', afterPartA.filterByKey('isApproved', true));
};
