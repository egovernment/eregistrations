// Controller for Official Revision application (applies for both server and client).

'use strict';

var assign               = require('es5-ext/object/assign')
  , hyphenToCamel        = require('es5-ext/string/#/hyphen-to-camel')
  , save                 = require('mano/utils/save')
  , normalizeOptions     = require('es5-ext/object/normalize-options')
  , commonController     = require('../user')
  , matchBusinessProcess = require('../utils/official-matcher');

module.exports = function (/*options*/) {
	var options    = normalizeOptions(arguments[0])
	  , stepName   = options.stepName || 'revision'
	  , matcher    = options.matcher || matchBusinessProcess
	  , controller = {};

	// Common controller - login and password change.
	assign(controller, commonController);

	// Approve revision.
	controller['revision/[0-9][a-z0-9]+/approve'] = {
		match: function (businessProcessId) {
			matcher.call(this, businessProcessId, stepName);
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
	controller['revision/[0-9][a-z0-9]+/return'] = {
		match: function (businessProcessId) {
			matcher.call(this, businessProcessId, stepName);
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
	controller['revision/[0-9][a-z0-9]+/reject'] = {
		match: function (businessProcessId) {
			matcher.call(this, businessProcessId, stepName);
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
	controller['revision-requirement-upload/[0-9][a-z0-9]+/[0-9a-z-]+'] = {
		match: function (businessProcessId, documentUniqueKey) {
			matcher.call(this, businessProcessId, stepName);
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
	controller['form-revision-payment-receipt-upload/[0-9][a-z0-9]+/[0-9a-z-]+'] = {
		match: function (businessProcessId, receiptKey) {
			matcher.call(this, businessProcessId, stepName);
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

	return controller;
};
