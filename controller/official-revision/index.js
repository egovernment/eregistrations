// Controller for Official Revision application (applies for both server and client).

'use strict';

var assign               = require('es5-ext/object/assign')
  , hyphenToCamel        = require('es5-ext/string/#/hyphen-to-camel')
  , save                 = require('mano/utils/save')
  , matchBusinessProcess = require('../utils/official-revision-matcher');

// Common controller - login and password change.
assign(exports, require('eregistrations/controller/user'));

// Approve revision.
exports['revision/[0-9][a-z0-9]+/approve'] = {
	match: function (businessProcessId) {
		matchBusinessProcess.call(this, businessProcessId);
		if (!this.businessProcess) return false;
		return this.processingStep.approvalProgress === 1;
	},
	validate: Function.prototype,
	submit: function () {
		this.processingStep.processor = this.user;
		this.processingStep.status = 'approved';
	},
	redirectUrl: '/'
};

// Send for corrections
exports['revision/[0-9][a-z0-9]+/return'] = {
	match: function (businessProcessId) {
		matchBusinessProcess.call(this, businessProcessId);
		if (!this.businessProcess) return false;
		return this.processingStep.sendBackStatusesProgress === 1 &&
			this.processingStep.revisionProgress === 1;
	},
	validate: Function.prototype,
	submit: function () {
		this.processingStep.processor = this.user;
		this.processingStep.status = 'sentBack';
	},
	redirectUrl: '/'
};

// Reject revision.
exports['revision/[0-9][a-z0-9]+/reject'] = {
	match: function (businessProcessId) {
		matchBusinessProcess.call(this, businessProcessId);
		return this.businessProcess ? true : false;
	},
	submit: function () {
		this.processingStep.processor = this.user;
		save.apply(this, arguments);
		this.processingStep.status = 'rejected';
	},
	redirectUrl: '/'
};

// Requirement upload revision.
exports['revision-requirement-upload/[0-9][a-z0-9]+/[0-9a-z-]+'] = {
	match: function (businessProcessId, documentUniqueKey) {
		matchBusinessProcess.call(this, businessProcessId);
		if (!this.businessProcess) return false;

		documentUniqueKey = hyphenToCamel.call(documentUniqueKey);
		return this.businessProcess.requirementUploads.applicable.some(function (requirementUpload) {
			if (requirementUpload.document.uniqueKey === documentUniqueKey) {
				return true;
			}
		}, this);
	},
	redirectUrl: function () {
		return '/' + this.businessProcess.__id__ + '/';
	},
	formHtmlId: 'form-revision-requirement-upload'
};

// Payment receipt revision.
exports['form-revision-payment-receipt-upload/[0-9][a-z0-9]+/[0-9a-z-]+'] = {
	match: function (businessProcessId, receiptKey) {
		matchBusinessProcess.call(this, businessProcessId);
		if (!this.businessProcess) return false;

		var paymentReceiptUpload =
			this.businessProcess.paymentReceiptUploads.map.get(hyphenToCamel.call(receiptKey));
		if (!paymentReceiptUpload) return false;

		return this.businessProcess.paymentReceiptUploads.applicable.has(paymentReceiptUpload);
	},
	redirectUrl: function () {
		return '/' + this.businessProcess.__id__ + '/';
	},
	formHtmlId: 'form-revision-payment-receipt-upload'
};
