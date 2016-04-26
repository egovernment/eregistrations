// Routes for the views.

'use strict';

var matchRequirementUpload    = require('./utils/match-requirement-upload')('businessProcess')
  , matchPaymentReceiptUpload = require('./utils/match-payment-receipt-upload')('businessProcess')
  , matchCertificate          = require('./utils/match-certificate')('businessProcess',
		'applicable');

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
		match: matchRequirementUpload,
		view: require('../view/business-process-submitted-document')
	},
	'payment-receipts/[a-z][a-z0-9-]*': {
		match: matchPaymentReceiptUpload,
		view: require('../view/business-process-submitted-payment')
	},
	'certificates/[a-z][a-z0-9-]*': {
		match: matchCertificate,
		view: require('../view/business-process-submitted-certificate')
	},
	data: require('../view/business-process-submitted-data'),

	// Print routes
	'data-print': require('../view/print-business-process-data'),
	'print-request-history': require('../view/print-business-process-status-log')
};
