// Routes for the views.

'use strict';

var db               = require('mano').db
  , hyphenToCamel    = require('es5-ext/string/#/hyphen-to-camel')
  , matchCertificate = require('./utils/match-certificate')('businessProcess', 'applicable');

var matchBusinessProcess = function (businessProcessId) {
	this.businessProcess = db.BusinessProcess.getById(businessProcessId);
	return Boolean(this.businessProcess);
};

module.exports = {
	'/': require('../view/user-home'),
	profile: {
		view: require('../view/user-profile'),
		decorateContext: function () {
			if (this.manager) {
				this.user = this.manager;
			}
		}
	},
	'managed-user-profile': require('../view/managed-user-profile'),
	requests: require('../view/user-requests'),
	'requests/[0-9][a-z0-9]+': {
		match: matchBusinessProcess,
		view: require('../view/user-business-process-summary')
	},
	'business-process/[0-9][a-z0-9]+/documents': {
		match: matchBusinessProcess,
		view: require('../view/user-business-process-documents-list')
	},
	'business-process/[0-9][a-z0-9]+/document/[a-z][a-z0-9-]*': {
		match: function (businessProcessId, uniqueKey) {
			if (!matchBusinessProcess.call(this, businessProcessId)) return false;

			uniqueKey = hyphenToCamel.call(uniqueKey);
			this.businessProcess.documents.processChainUploaded.some(function (document) {
				if (document.uniqueKey === uniqueKey) {
					this.document = document;
					return true;
				}
			}, this);

			return Boolean(this.document);
		},
		view: require('../view/business-process-document')
	},
	'business-process/[0-9][a-z0-9]+/certificate/[a-z][a-z0-9-]*': {
		match: function (businessProcessId, certificateKey) {
			if (!matchBusinessProcess.call(this, businessProcessId)) return false;

			return matchCertificate.call(this, certificateKey);
		},
		view: require('../view/business-process-document')
	},
	'business-process/[0-9][a-z0-9]+/data': {
		match: matchBusinessProcess,
		view: require('../view/user-business-process-data')
	},
	'business-process/[0-9][a-z0-9]+/print-data': {
		match: matchBusinessProcess,
		view: require('../view/print-business-process-chain-data')
	}
};
