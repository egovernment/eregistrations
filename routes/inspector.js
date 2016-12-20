// Routes for the views

'use strict';

var hyphenToCamel        = require('es5-ext/string/#/hyphen-to-camel')
  , matchBusinessProcess = require('./utils/inspector-match-business-process')
  , findFirstUploadKey   = require('./utils/inspector-find-first-upload-key')
  , matchUpload          = require('./utils/inspector-match-upload')
  , matchCertificate     = require('./utils/inspector-match-certificate');

module.exports = function () {
	var match = matchBusinessProcess();

	return {
		// User routes
		profile: require('../view/user-profile'),

		// App routes
		'/': require('../view/inspector'),
		'[0-9][a-z0-9]*': {
			match: function (businessProcessId) {
				return match.call(this, businessProcessId).then(function (result) {
					if (!result) return false;
					var firstUniqueKey = findFirstUploadKey.call(this, 'requirementUpload');
					if (firstUniqueKey) {
						return matchUpload.call(this, 'requirementUpload', firstUniqueKey);
					}
					return true;
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
		}
	};
};
