// Routes for the views.

'use strict';

var db            = require('mano').db
  , hyphenToCamel = require('es5-ext/string/#/hyphen-to-camel');

var matchBusinessProcess = function (businessProcessId) {
	this.businessProcess = db.BusinessProcess.getById(businessProcessId);

	if (this.businessProcess) {
		this.processingStep = this.businessProcess.processingSteps.map.${ appNameSuffix };
		if (!this.processingStep.isReady) return false;
		if (this.processingStep.steps) {
			this.processingStep = this.processingStep.steps.applicable.first;
		}
		return true;
	}

	return false;
};

module.exports = {
	profile: require('eregistrations/view/user-profile'),
	'/': require('../../view/${ appName }/business-processes-table'),
	'print-business-processes-list':
		require('../../view/${ appName }/print-business-processes-table'),
	'[0-9][a-z0-9]*': {
		match: matchBusinessProcess,
		view: require('../../view/${ appName }/business-process-form')
	},
	'[0-9][a-z0-9]*/print-request-history': {
		match: matchBusinessProcess,
		view: require('eregistrations/view/print-business-process-status-log')
	},
	'[0-9][a-z0-9]*/data-print': {
		match: matchBusinessProcess,
		view: require('eregistrations/view/print-business-process-data')
	},
	'[0-9][a-z0-9]*/documents-and-data': {
		match: matchBusinessProcess,
		view: require('eregistrations/view/business-process-official-data')
	},
	'[0-9][a-z0-9]*/document/[a-z][a-z0-9-]*': {
		match: function (businessProcessId, documentUniqueKey) {
			var self = this;

			if (!matchBusinessProcess.call(self, businessProcessId)) return false;

			documentUniqueKey = hyphenToCamel.call(documentUniqueKey);
			return self.businessProcess.requirementUploads.applicable.some(function (requirementUpload) {
				if (requirementUpload.document.uniqueKey === documentUniqueKey) {
					self.document = requirementUpload.document;
					return true;
				}
			});
		},
		view: require('eregistrations/view/business-process-document')
	},
	'[0-9][a-z0-9]*/receipt/[a-z][a-z0-9-]*': {
		match: function (businessProcessId, receiptKey) {
			if (!matchBusinessProcess.call(this, businessProcessId)) return false;

			var paymentReceiptUpload =
				this.businessProcess.paymentReceiptUploads.map.get(hyphenToCamel.call(receiptKey));
			if (!paymentReceiptUpload) return false;
			if (!this.businessProcess.paymentReceiptUploads.applicable.has(paymentReceiptUpload)) {
				return false;
			}

			this.document = paymentReceiptUpload.document;
			return true;
		},
		view: require('eregistrations/view/business-process-document')
	},
	'[0-9][a-z0-9]*/certificate/[a-z][a-z0-9-]*': {
		match: function (businessProcessId, certificateKey) {
			if (!matchBusinessProcess.call(this, businessProcessId)) return false;

			var certificate =
				this.businessProcess.certificates.map.get(hyphenToCamel.call(certificateKey));
			if (!certificate) return false;
			if (!this.businessProcess.certificates.applicable.has(certificate)) {
				return false;
			}

			this.document = certificate;
			return true;
		},
		view: require('eregistrations/view/business-process-document')
	}
};
