// Routes for the application view.

'use strict';

var db            = require('mano').db
  , hyphenToCamel = require('es5-ext/string/#/hyphen-to-camel');

// require custom overrides of eregistrations views here.
// For example:
// require('../../view/user');
// require('../../view/print-base');
// require('../../view/_business-process-table-columns');

var matchBusinessProcess = function (businessProcessId) {
	this.businessProcess = db.BusinessProcess.getById(businessProcessId);
	return Boolean(this.businessProcess);
};

module.exports = {
	'/': require('eregistrations/view/user-home'),
	profile: require('eregistrations/view/user-profile'),
	requests: require('eregistrations/view/user-requests'),
	'requests/[0-9][a-z0-9]+': {
		match: matchBusinessProcess,
		view: require('eregistrations/view/user-business-process-summary')
	},
	'business-process/[0-9][a-z0-9]+/documents': {
		match: matchBusinessProcess,
		view: require('eregistrations/view/user-business-process-documents-list')
	},
	'business-process/[0-9][a-z0-9]+/document/[a-z][a-z0-9-]*': {
		match: function (businessProcessId, uniqueKey) {
			var self = this;

			if (!matchBusinessProcess.call(self, businessProcessId)) return false;

			uniqueKey = hyphenToCamel.call(uniqueKey);
			self.businessProcess.documents.processChainUploaded.some(function (document) {
				if (document.uniqueKey === uniqueKey) {
					self.document = document;
					return true;
				}
			});

			return Boolean(self.document);
		},
		view: require('eregistrations/view/business-process-document')
	},
	'business-process/[0-9][a-z0-9]+/certificate/[a-z][a-z0-9-]*': {
		match: function (businessProcessId, key) {
			var self = this;

			if (!matchBusinessProcess.call(self, businessProcessId)) return false;

			var certificate = self.businessProcess.certificates.map.get(hyphenToCamel.call(key));
			if (!certificate) return false;
			if (!self.businessProcess.certificates.applicable.has(certificate)) {
				return false;
			}

			self.document = certificate;
			return true;
		},
		view: require('eregistrations/view/business-process-document')
	},
	'business-process/[0-9][a-z0-9]+/data': {
		match: matchBusinessProcess,
		view: require('eregistrations/view/user-business-process-data')
	},
	'business-process/[0-9][a-z0-9]+/print-data': {
		match: matchBusinessProcess,
		view: require('eregistrations/view/print-business-process-chain-data')
	}
};
