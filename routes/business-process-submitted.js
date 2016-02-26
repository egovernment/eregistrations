// Routes for the views.

'use strict';

var hyphenToCamel = require('es5-ext/string/#/hyphen-to-camel');

module.exports = {
	'/': require('../view/business-process-submitted'),
	profile: {
		view: require('../view/user-profile'),
		decorateContext: function () {
			if (this.manager) {
				this.user = this.manager;
			}
		}
	},
	'managed-user-profile': require('../view/managed-user-profile'),
	'data-print': require('../view/print-business-process-data'),
	'document/[a-z][a-z0-9-]*': {
		match: function (uniqueKey) {
			var self = this;

			uniqueKey = hyphenToCamel.call(uniqueKey);
			self.businessProcess.requirementUploads.applicable.some(function (requirementUpload) {
				if (requirementUpload.document.uniqueKey === uniqueKey) {
					self.document = requirementUpload.document;
					return true;
				}
			});
			return Boolean(self.document);
		},
		view: require('../view/business-process-document')
	},
	'receipt/[a-z][a-z0-9-]*': {
		match: function (key) {
			var paymentReceiptUpload =
				this.businessProcess.paymentReceiptUploads.map.get(hyphenToCamel.call(key));
			if (!paymentReceiptUpload) return false;
			if (!this.businessProcess.paymentReceiptUploads.applicable.has(paymentReceiptUpload)) {
				return false;
			}

			this.document = paymentReceiptUpload.document;
			return true;
		},
		view: require('../view/business-process-document')
	},
	'certificate/[a-z][a-z0-9-]*': {
		match: function (key) {
			var certificate = this.businessProcess.certificates.map.get(hyphenToCamel.call(key));
			if (!certificate) return false;
			if (!this.businessProcess.certificates.applicable.has(certificate)) {
				return false;
			}

			this.document = certificate;
			return true;
		},
		view: require('../view/business-process-document')
	},
	'print-request-history': require('../view/print-business-process-status-log')
};
