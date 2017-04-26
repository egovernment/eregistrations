'use strict';

var ensureObject   = require('es5-ext/object/valid-object')
  , ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , ensureDatabase = require('dbjs/valid-dbjs')
  , rejectionReason;

rejectionReason = function (ownerType, types, value) {
	var reason = {};
	reason.types = typeof types === 'object' ? types : [];
	reason.value = value || '';
	reason.ownerType = ownerType || '';

	return reason;
};

module.exports = exports = function (db) {
	ensureDatabase(db);

	return function (query) {
		var businessProcessId = ensureString(ensureObject(query).businessProcessId), businessProcess
		  , result, types, otherValue;
		result = {
			hasOnlySystemicReasons: true,
			rejectionType: null,
			rejectionReasons: [],
			service: {
				type: null,
				id: null,
				businessName: null
			},
			operator: {
				id: null,
				name: null
			},
			processingStep: {
				path: null,
				label: null
			},
			date: null
		};
		businessProcess = db.BusinessProcess.getById(businessProcessId);
		if (!businessProcess) return;
		result.service.businessName = businessProcess.businessName;
		result.service.id = businessProcessId;
		result.service.type = businessProcess.constructor.__id__;
		//rejectionReasons -> processingSteps
		businessProcess.processingSteps.applicable.some(function (processingStep) {
			otherValue = '';
			if (!processingStep.isRejected && !processingStep.isSentBack) return;
			result.rejectionType = processingStep.isRejected ? 'rejected' : 'sentBack';
			if (processingStep.steps) { // processingStepGroup. We need the full path.
				processingStep.steps.applicable.some(function (step) {
					if (!step.isRejected && !step.isSentBack) return;
					result.processingStep.label = step.label;
					result.processingStep.path = step.__id__.slice(step.__id__.indexOf('/'));
					otherValue = step.rejectionReason || '';
					result.operator.id = step.processor.__id__;
					result.operator.name = step.processor.fullName;
					return true;
				});
			} else { // standard processingStep.
				result.processingStep.label = processingStep.label;
				result.processingStep.path =
					processingStep.__id__.slice(processingStep.__id__.indexOf('/'));
				otherValue = processingStep.rejectionReason || '';
				result.operator.id = processingStep.processor.__id__;
				result.operator.name = processingStep.processor.fullName;

			}
			if (processingStep.isRejected) {
				result.hasOnlySystemicReasons = false;
				result.rejectionReasons.push(rejectionReason('processingStep', ['other'], otherValue));
			}
			return true;
		});
		//rejectionReasons -> data
		if (businessProcess.dataForms.rejectReason) {
			result.hasOnlySystemicReasons = false;
			result.rejectionReasons.push(rejectionReason('data', ['other'],
				businessProcess.dataForms.rejectReason));
		}
		//rejectionReasons -> requirementUploads
		businessProcess.requirementUploads.applicable.forEach(function (requirementUpload) {
			if (requirementUpload.status !== 'invalid') return;
			types = [];
			otherValue = '';
			requirementUpload.rejectReasonTypes.forEach(function (type) {
				if (type === 'other') {
					result.hasOnlySystemicReasons = false;
					otherValue = requirementUpload.rejectReasonMemo;
				}
				types.push(type);
			});
			result.rejectionReasons.push(rejectionReason('requirementUpload', types, otherValue));
		});
		//rejectionReasons -> paymentReceiptUploads
		businessProcess.paymentReceiptUploads.applicable.forEach(function (paymentReceiptUpload) {
			if (paymentReceiptUpload.status !== 'invalid') return;
			result.hasOnlySystemicReasons = false;
			result.rejectionReasons.push(
				rejectionReason('paymentReceipt', ['other'], paymentReceiptUpload.rejectReasonMemo)
			);
		});

		result.date = Date.now();

		return result;
	};
};
