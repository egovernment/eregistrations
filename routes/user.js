// Routes for the views.

'use strict';

var db            = require('mano').db
  , hyphenToCamel = require('es5-ext/string/#/hyphen-to-camel');

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
	requests: require('../view/user-requests'),
	'requests/[0-9][a-z0-9]+': {
		match: function (businessProcessId) {
			return matchBusinessProcess.call(this, businessProcessId);
		},
		view: require('../view/user-business-process-summary')
	},
	'business-process/[0-9][a-z0-9]+/documents': {
		match: function (businessProcessId) {
			return matchBusinessProcess.call(this, businessProcessId);
		},
		view: require('../view/user-business-process-documents-list')
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
		view: require('../view/business-process-document')
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
		view: require('../view/business-process-document')
	},
	'business-process/[0-9][a-z0-9]+/data': {
		match: function (businessProcessId) {
			return matchBusinessProcess.call(this, businessProcessId);
		},
		view: require('../view/user-business-process-data')
	},
	'business-process/[0-9][a-z0-9]+/print-data': {
		match: function (businessProcessId) {
			return matchBusinessProcess.call(this, businessProcessId);
		},
		view: require('../view/print-business-process-chain-data')
	}
};
