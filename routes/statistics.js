'use strict';

var hyphenToCamel                  = require('es5-ext/string/#/hyphen-to-camel')
  , matchBusinessProcess           = require('./utils/page-match-business-process')
  , findFirstUploadKey             = require('./utils/page-find-first-upload-key')
  , matchUpload                    = require('./utils/page-match-upload')
  , matchFirstRequirementUpload    = require('./utils/page-match-first-requirement-upload')
  , matchFirstPaymentReceiptUpload = require('./utils/page-match-first-payment-receipt-upload')
  , matchFirstCertificate          = require('./utils/page-match-first-certificate')
  , matchCertificate               = require('./utils/user-match-certificate')
  , processingStepsMeta            = require('../processing-steps-meta')
  , includeProfileController       = require('./utils/include-profile-controller');

module.exports = function () {
	var match = matchBusinessProcess('statistics');

	var routes = {
		// Pages with statistics information
		'/': require('../view/statistics-dashboard'),
		'dashboard-old': {
			decorateContext: function () {
				this.processingStepsMeta = processingStepsMeta;
			},
			view: require('../view/statistics-dashboard-old')
		},
		'files/certificates-issued': require('../view/statistics-certificates-issued'),
		'files/by-role': {
			view: require('../view/statistics-files-roles')
		},
		'files/by-operator': {
			view: require('../view/statistics-files-operators')
		},
		'files/pending': {
			decorateContext: function () {
				this.processingStepsMeta = processingStepsMeta;
			},
			view: require('../view/statistics-files-pending')
		},
		'files/details': require('../view/statistics-files-details'),
		time: {
			decorateContext: function () {
				this.processingStepsMeta = processingStepsMeta;
			},
			view: require('../view/statistics-time-per-role')
		},
		'time/per-person': {
			decorateContext: function () {
				this.processingStepsMeta = processingStepsMeta;
			},
			view: require('../view/statistics-time-per-person')
		},
		rejections: require('../view/statistics-rejections'),
		accounts: require('../view/statistics-accounts'),
		old: require('../view/statistics-old'),

		// Business process views

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
					return matchCertificate.call(this, hyphenToCamel.call(uniqueKey), {
						collection: 'applicable'
					});
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
		}
	};

	includeProfileController(routes);

	return routes;
};
