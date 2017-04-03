// Routes for the views.

'use strict';

var hyphenToCamel    = require('es5-ext/string/#/hyphen-to-camel')
  , matchUpload      = require('./utils/user-match-upload')
  , matchCertificate = require('./utils/user-match-certificate');

module.exports = {
	// User routes
	profile: {
		view: require('../view/user-profile'),
		decorateContext: function () {
			if (this.manager) this.user = this.manager;
		}
	},
	'managed-user-profile': require('../view/managed-user-profile'),

	// App routes
	'/': {
		decorateContext: function () {
			var firstUpload;

			// Available requirement upload
			firstUpload = this.businessProcess.requirementUploads.dataSnapshot.resolved[0];
			if (firstUpload) return matchUpload.call(this, 'requirementUpload', firstUpload.uniqueKey);

			// Available payment receipt upload
			firstUpload = this.businessProcess.paymentReceiptUploads.dataSnapshot.resolved[0];
			if (firstUpload) return matchUpload.call(this, 'paymentReceiptUpload', firstUpload.uniqueKey);

			// Available certificate
			if (this.businessProcess.isApproved) {
				firstUpload = this.businessProcess.certificates.dataSnapshot.resolved[0];
				if (firstUpload) return matchCertificate.call(this, firstUpload.uniqueKey);
			}

			// Fallback to data
			this.dataSnapshot = this.businessProcess.dataForms.dataSnapshot.resolved;
		},
		resolveView: function () {
			if (this.document) {
				if (this.documentKind === 'requirementUpload') {
					return require('../view/business-process-submitted-document');
				}

				return require('../view/business-process-submitted-payment');
			}
			return require('../view/business-process-submitted-data');
		}
	},
	'documents/[a-z][a-z0-9-]*': {
		match: function (uniqueKey) {
			var firstUpload = this.businessProcess.requirementUploads.dataSnapshot.resolved[0];
			uniqueKey = hyphenToCamel.call(uniqueKey);

			if (firstUpload && (firstUpload.uniqueKey === uniqueKey)) return false;
			return matchUpload.call(this, 'requirementUpload', uniqueKey);
		},
		view: require('../view/business-process-submitted-document')
	},
	'payment-receipts/[a-z][a-z0-9-]*': {
		match: function (uniqueKey) {
			return matchUpload.call(this, 'paymentReceiptUpload', hyphenToCamel.call(uniqueKey));
		},
		view: require('../view/business-process-submitted-payment')
	},
	'certificates/[a-z][a-z0-9-]*': {
		match: function (uniqueKey) {
			return matchCertificate.call(this, hyphenToCamel.call(uniqueKey));
		},
		view: require('../view/business-process-submitted-certificate')
	},
	data: {
		decorateContext: function () {
			this.dataSnapshot = this.businessProcess.dataForms.dataSnapshot.resolved;
		},
		view: require('../view/business-process-submitted-data')
	}
};
