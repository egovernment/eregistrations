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
			var firstUpload = this.businessProcess.requirementUploads.dataSnapshot.resolved[0];
			if (firstUpload) matchUpload.call(this, 'requirementUpload', firstUpload.uniqueKey);
		},
		view: require('../view/business-process-submitted-document')
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
			if (!this.businessProcess.isApproved) return;
			return matchCertificate.call(this, hyphenToCamel.call(uniqueKey));
		},
		view: require('../view/business-process-submitted-certificate')
	},
	data: require('../view/business-process-submitted-data'),

	// Print routes
	'data-print': require('../view/print-business-process-data'),
	'print-request-history': require('../view/print-business-process-status-log')
};
