// Routes for the views.
'use strict';

var hyphenToCamel        = require('es5-ext/string/#/hyphen-to-camel')
  , matchBusinessProcess = require('./utils/official-match-business-process');

module.exports = function (step) {
	if (!step) {
		throw new Error('No step provided for official route');
	}
	var match = matchBusinessProcess(step);
	return {
		// User routes
		profile: require('../view/user-profile'),

		// App routes
		'/': require('../view/business-processes-table'),
		'[0-9][a-z0-9]*': {
			match: match,
			view: require('../view/business-process-official-form')
		},
		'[0-9][a-z0-9]*/documents': {
			match: match,
			decorateContext: function () {
				var requirementUpload = this.businessProcess.requirementUploads.applicable.first;

				if (requirementUpload) {
					this.document = requirementUpload.document;
				}
			},
			view: require('../view/business-process-official-document')
		},
		'[0-9][a-z0-9]*/documents/[a-z][a-z0-9-]*': {
			match: function (businessProcessId, documentUniqueKey) {
				return match.call(this, businessProcessId).then(function (result) {
					if (!result) return false;
					documentUniqueKey = hyphenToCamel.call(documentUniqueKey);

					return this.processingStep.requirementUploads.applicable
						.some(function (requirementUpload) {
							if (requirementUpload.document.uniqueKey === documentUniqueKey) {
								this.document = requirementUpload.document;
								return true;
							}
						}, this);
				}.bind(this));
			},
			view: require('../view/business-process-official-document')
		},
		'[0-9][a-z0-9]*/payment-receipts/[a-z][a-z0-9-]*': {
			match: function (businessProcessId, receiptKey) {
				return match.call(this, businessProcessId).then(function (result) {
					if (!result) return false;
					var paymentReceiptUpload =
						this.businessProcess.paymentReceiptUploads.map.get(hyphenToCamel.call(receiptKey));
					if (!paymentReceiptUpload) return false;
					if (!this.processingStep.paymentReceiptUploads.applicable.has(paymentReceiptUpload)) {
						return false;
					}

					this.document = paymentReceiptUpload.document;
					return true;
				}.bind(this));
			},
			view: require('../view/business-process-official-payment')
		},
		'[0-9][a-z0-9]*/certificates/[a-z][a-z0-9-]*': {
			match: function (businessProcessId, certificateKey) {

				return match.call(this, businessProcessId).then(function (result) {
					if (!result) return false;

					var certificate =
						this.businessProcess.certificates.map.get(hyphenToCamel.call(certificateKey));
					if (!certificate) return false;
					if (!this.processingStep.certificates.uploaded.has(certificate)) {
						return false;
					}

					this.document = certificate;
					return true;
				}.bind(this));
			},
			view: require('../view/business-process-official-certificate')
		},
		'[0-9][a-z0-9]*/data': {
			match: match,
			view: require('../view/business-process-official-data')
		},

		// Print routes
		'print-business-processes-list': require('../view/print-business-processes-table'),
		'[0-9][a-z0-9]*/print-request-history': {
			match: match,
			view: require('../view/print-business-process-status-log')
		},
		'[0-9][a-z0-9]*/data-print': {
			match: match,
			view: require('../view/print-business-process-data')
		}
	};
};
