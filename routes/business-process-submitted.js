// Routes for the views.

'use strict';

var hyphenToCamel = require('es5-ext/string/#/hyphen-to-camel');

module.exports = {
	// User routes
	profile: {
		view: require('../view/user-profile'),
		decorateContext: function () {
			if (this.manager) {
				this.user = this.manager;
			}
		}
	},
	'managed-user-profile': require('../view/managed-user-profile'),

	// App routes
	'/': {
		decorateContext: function () {
			var requirementUpload = this.businessProcess.requirementUploads.applicable.first;

			if (requirementUpload) {
				this.document = requirementUpload.document;
			}
		},
		view: require('../view/business-process-submitted-document')
	},
	'documents/[a-z][a-z0-9-]*': {
		match: function (uniqueKey) {
			uniqueKey = hyphenToCamel.call(uniqueKey);
			this.businessProcess.requirementUploads.dataSnapshot.resolved.some(function (data) {
				if (data.uniqueKey === uniqueKey) {
					this.dataSnapshot = data;
					return true;
				}
			}, this);
			if (!this.dataSnapshot) return false;
			this.businessProcess.requirementUploads.applicable.some(function (requirementUpload) {
				if (requirementUpload.document.uniqueKey === uniqueKey) {
					this.document = requirementUpload.document;
					return true;
				}
			}, this);
			this.documentKind = 'requirementUpload';
			this.documentUniqueKey = uniqueKey;
			this.documentUniqueId =
				this.businessProcess.__id__ + '/' + this.documentKind + '/' + uniqueKey;
			return true;
		},
		view: require('../view/business-process-submitted-document')
	},
	'payment-receipts/[a-z][a-z0-9-]*': {
		match: function (uniqueKey) {
			var paymentReceiptUpload;
			uniqueKey = hyphenToCamel.call(uniqueKey);
			this.businessProcess.paymentReceiptUploads.dataSnapshot.resolved.some(function (data) {
				if (data.uniqueKey === uniqueKey) {
					this.dataSnapshot = data;
					return true;
				}
			}, this);
			if (!this.dataSnapshot) return false;
			paymentReceiptUpload = this.businessProcess.paymentReceiptUploads.map[uniqueKey];
			if (paymentReceiptUpload &&
					this.businessProcess.paymentReceiptUploads.applicable.has(paymentReceiptUpload)) {
				this.document = paymentReceiptUpload.document;
			}
			this.documentKind = 'paymentReceiptUpload';
			this.documentUniqueKey = uniqueKey;
			this.documentUniqueId =
				this.businessProcess.__id__ + '/' + this.documentKind + '/' + uniqueKey;
			return true;
		},
		view: require('../view/business-process-submitted-payment')
	},
	'certificates/[a-z][a-z0-9-]*': {
		match: function (uniqueKey) {
			if (!this.businessProcess.isApproved) return;
			uniqueKey = hyphenToCamel.call(uniqueKey);
			this.businessProcess.certificates.dataSnapshot.resolved.some(function (data) {
				if (data.uniqueKey === uniqueKey) {
					this.dataSnapshot = data;
					return true;
				}
			}, this);
			if (!this.dataSnapshot) return false;

			this.documentKind = 'certificate';
			this.documentUniqueKey = uniqueKey;
			this.documentUniqueId =
				this.businessProcess.__id__ + '/' + this.documentKind + '/' + uniqueKey;
			return true;
		},
		view: require('../view/business-process-submitted-certificate')
	},
	data: require('../view/business-process-submitted-data'),

	// Print routes
	'data-print': require('../view/print-business-process-data'),
	'print-request-history': require('../view/print-business-process-status-log')
};
