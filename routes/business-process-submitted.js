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
			this.kind = 'requirementUpload';
			this.uniqueId = this.businessProcess.__id__ + '/' + this.kind + '/' + uniqueKey;
			return true;
		},
		view: require('../view/business-process-document')
	},
	'receipt/[a-z][a-z0-9-]*': {
		match: function (uniqueKey) {
			var paymentReceiptUpload;
			uniqueKey = hyphenToCamel.call(uniqueKey);
			this.businessProcess.requirementUploads.dataSnapshot.resolved.some(function (data) {
				if (data.uniqueKey === uniqueKey) {
					this.dataSnapshot = data;
					return true;
				}
			}, this);
			if (!this.dataSnapshot) return false;
			paymentReceiptUpload = this.businessProcess.paymentReceiptUploads.map[uniqueKey];
			if (paymentReceiptUpload) this.document = paymentReceiptUpload.document;
			this.kind = 'paymentReceiptUpload';
			this.uniqueId = this.businessProcess.__id__ + '/' + this.kind + '/' + uniqueKey;
			return true;
		},
		view: require('../view/business-process-document')
	},
	'certificate/[a-z][a-z0-9-]*': {
		match: function (uniqueKey) {
			if (!this.businessProcess.isClosed) return;
			uniqueKey = hyphenToCamel.call(uniqueKey);
			this.businessProcess.certificates.dataSnapshot.resolved.some(function (data) {
				if (data.uniqueKey === uniqueKey) {
					this.dataSnapshot = data;
					return true;
				}
			}, this);
			if (!this.dataSnapshot) return false;

			this.document = this.businessProcess.certificates.map[uniqueKey];
			this.kind = 'certificate';
			this.uniqueId = this.businessProcess.__id__ + '/' + this.kind + '/' + uniqueKey;
			return true;
		},
		view: require('../view/business-process-document')
	},
	'print-request-history': require('../view/print-business-process-status-log')
};
