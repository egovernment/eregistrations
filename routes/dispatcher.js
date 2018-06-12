// Routes for the views.
'use strict';

var hyphenToCamel                  = require('es5-ext/string/#/hyphen-to-camel')
  , matchBusinessProcess           = require('./utils/official-match-business-process')
  , findFirstUploadKey             = require('./utils/official-find-first-upload-key')
  , matchUpload                    = require('./utils/official-match-upload')
  , matchFirstRequirementUpload    = require('./utils/official-match-first-requirement-upload')
  , matchFirstPaymentReceiptUpload = require('./utils/official-match-first-payment-receipt-upload')
  , matchFirstCertificate          = require('./utils/official-match-first-certificate')
  , matchCertificate               = require('./utils/official-match-certificate')
  , includeProfileController       = require('./utils/include-profile-controller');

module.exports = function () {
	var match = matchBusinessProcess(false);
	var routes = {
		// App routes
		'/': {
			view: require('../view/dispatcher-assignments-panel')
		},
		'[0-9][a-z0-9]*': {
			match: function (businessProcessId) {
				return match.call(this, businessProcessId).then(function (result) {
					if (!result) return false;

					if (matchFirstRequirementUpload.call(this)) return true;
					if (matchFirstPaymentReceiptUpload.call(this)) return true;
					if (matchFirstCertificate.call(this)) return true;

					return true;
				}.bind(this));
			},
			decorateContext: function () {
				if (!this.documentUniqueKey) {
					this.dataSnapshot = this.businessProcess.dataForms.dataSnapshot.resolved;
				}
			},
			resolveView: function () {
				if (this.documentUniqueKey) {
					if (this.documentKind === 'requirementUpload') {
						return require('../view/business-process-official-document');
					}

					if (this.documentKind === 'paymentReceiptUpload') {
						return require('../view/business-process-official-payment');
					}

					return require('../view/business-process-official-certificate');
				}
				return require('../view/business-process-official-data');
			}
		},
		'[0-9][a-z0-9]*/documents/[a-z][a-z0-9-]*': {
			match: function (businessProcessId, uniqueKey) {
				return match.call(this, businessProcessId).then(function (result) {
					if (!result) return false;
					var firstUniqueKey = findFirstUploadKey.call(this, 'requirementUpload');
					if (!firstUniqueKey) return false;
					uniqueKey = hyphenToCamel.call(uniqueKey);
					if (firstUniqueKey === uniqueKey) return false;
					return matchUpload.call(this, 'requirementUpload', uniqueKey);
				}.bind(this));
			},
			view: require('../view/business-process-official-document')
		},
		'[0-9][a-z0-9]*/payment-receipts/[a-z][a-z0-9-]*': {
			match: function (businessProcessId, uniqueKey) {
				return match.call(this, businessProcessId).then(function (result) {
					if (!result) return false;
					return matchUpload.call(this, 'paymentReceiptUpload', hyphenToCamel.call(uniqueKey));
				}.bind(this));
			},
			view: require('../view/business-process-official-payment')
		},
		'[0-9][a-z0-9]*/certificates/[a-z][a-z0-9-]*': {
			match: function (businessProcessId, uniqueKey) {
				return match.call(this, businessProcessId).then(function (result) {
					if (!result) return false;
					return matchCertificate.call(this, hyphenToCamel.call(uniqueKey));
				}.bind(this));
			},
			view: require('../view/business-process-official-certificate')
		},
		'[0-9][a-z0-9]*/data': {
			match: match,
			decorateContext: function () {
				this.dataSnapshot = this.businessProcess.dataForms.dataSnapshot.resolved;
			},
			view: require('../view/business-process-official-data')
		},

		// Print routes
		'print-business-processes-list': require('../view/print-business-processes-table')
	};

	includeProfileController(routes);

	return routes;
};
