'use strict';

var ensureObject   = require('es5-ext/object/valid-object')
  , ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , ensureDatabase = require('dbjs/valid-dbjs')
  , rejectionReason;

rejectionReason = function (ownerType, types, value, path) {
	var reason = {};
	reason.types = typeof types === 'object' ? types : [];
	reason.value = value || '';
	reason.ownerType = ownerType || '';
	reason.path = path || '';

	return reason;
};

module.exports = exports = function (db) {
	ensureDatabase(db);

	return function (query) {
		var businessProcessId = ensureString(ensureObject(query).businessProcessId)
		  , businessProcess, types, otherValue, processStep
		  , result = {
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
			occurrencesCount: 1,
			date: {
				ts: null,
				date: null
			}
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
			processStep = processingStep;

			result.rejectionType = processingStep.isRejected ? 'rejected' : 'sentBack';
			if (processingStep.steps) { // processingStepGroup. We need the full path.
				processingStep.steps.applicable.some(function (step) {
					if (!step.isRejected && !step.isSentBack) return;
					processStep = step;
					return true;
				});
			}
			result.processingStep.label = processStep.label;
			result.processingStep.path = processStep.__id__.slice(processStep.__id__.indexOf('/'));
			result.operator.id = processStep.processor.__id__;
			result.operator.name = processStep.processor.fullName;
			processStep._status._lastModified.map(function (time) {
				time = Math.round(time / 1000);
				result.date.ts = time;
				result.date.date = Number(db.Date(time));
			});
			otherValue = processStep.rejectionReason || '';
			if (processingStep.isRejected) {
				result.hasOnlySystemicReasons = false;
				result.rejectionReasons.push(
					rejectionReason('processingStep', ['other'], otherValue, '')
				);
			} else if (processStep.customRejectionReasons.size) {
				result.rejectionReasons.push(
					rejectionReason('processingStep', ['other'],
						processStep.customRejectionReasons.toArray().join(', '), '')
				);
			}
			return true;
		});
		//rejectionReasons -> data
		if (businessProcess.dataForms.rejectReason) {
			result.hasOnlySystemicReasons = false;
			result.rejectionReasons.push(rejectionReason('data', ['other'],
				businessProcess.dataForms.rejectReason, ''));
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
			result.rejectionReasons.push(
				rejectionReason('requirementUpload', types, otherValue
				  , requirementUpload.__id__.slice(requirementUpload.__id__.indexOf('/')))
			);
		});
		//rejectionReasons -> paymentReceiptUploads
		businessProcess.paymentReceiptUploads.applicable.forEach(function (paymentReceiptUpload) {
			if (paymentReceiptUpload.status !== 'invalid') return;
			result.hasOnlySystemicReasons = false;
			result.rejectionReasons.push(
				rejectionReason('paymentReceipt', ['other'], paymentReceiptUpload.rejectReasonMemo
				  , paymentReceiptUpload.__id__.slice(paymentReceiptUpload.__id__.indexOf('/')))
			);
		});

		return result;
	};
};
