// Routes for the views.

'use strict';

var hyphenToCamel                  = require('es5-ext/string/#/hyphen-to-camel')
  , matchUpload                    = require('./utils/user-match-upload')
  , matchFirstRequirementUpload    = require('./utils/user-match-first-requirement-upload')
  , matchFirstPaymentReceiptUpload = require('./utils/user-match-first-payment-receipt-upload')
  , matchFirstCertificate          = require('./utils/user-match-first-certificate')
  , matchCertificate               = require('./utils/user-match-certificate')
  , includeProfileController       = require('./utils/include-profile-controller');

module.exports = exports = {
	'managed-user-profile': require('../view/managed-user-profile'),

	// App routes
	'/': {
		decorateContext: function () {
			if (matchFirstRequirementUpload.call(this)) return true;
			if (matchFirstPaymentReceiptUpload.call(this)) return true;
			if (matchFirstCertificate.call(this)) return true;

			// Fallback to data
			this.dataSnapshot = this.businessProcess.dataForms.dataSnapshot.resolved;
		},
		resolveView: function () {
			if (this.documentUniqueKey) {
				if (this.documentKind === 'requirementUpload') {
					return require('../view/business-process-submitted-document');
				}

				if (this.documentKind === 'paymentReceiptUpload') {
					return require('../view/business-process-submitted-payment');
				}

				return require('../view/business-process-submitted-certificate');
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

includeProfileController(exports, true);
