// Routes for the views

'use strict';

var hyphenToCamel        = require('es5-ext/string/#/hyphen-to-camel')
  , matchBusinessProcess = require('./utils/official-match-business-process')
  , findFirstUploadKey   = require('./utils/official-find-first-upload-key')
  , matchUpload          = require('./utils/official-match-upload')
  , matchCertificate     = require('./utils/official-match-certificate');

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
			match: function (businessProcessId) {
				return match.call(this, businessProcessId).then(function (result) {
					if (!result) return false;
					var firstUniqueKey = findFirstUploadKey.call(this, 'requirementUpload');
					if (!firstUniqueKey) return false;
					return matchUpload.call(this, 'requirementUpload', firstUniqueKey);
				}.bind(this));
			},
			view: require('../view/business-process-official-document')
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
		'print-business-processes-list': require('../view/print-business-processes-table'),
		'[0-9][a-z0-9]*/print-request-history': {
			match: match,
			view: require('../view/print-business-process-status-log')
		}
	};
};
