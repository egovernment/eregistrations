// Routes for the views.

'use strict';

var hyphenToCamel = require('es5-ext/string/#/hyphen-to-camel')
  , db            = require('mano').db;

var matchBusinessProcess = function (businessProcessId) {
	this.businessProcess = db.BusinessProcess.getById(businessProcessId);
	if (!this.businessProcess) return false;
	return this.businessProcess.isSubmitted;
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
			this.businessProcess.requirementUploads.dataSnapshot.resolved.some(function (data) {
				if (data.uniqueKey === uniqueKey) {
					this.dataSnapshot = data;
					return true;
				}
			}, this);
			if (!this.dataSnapshot) return false;
			this.businessProcess.requirementUploads.applicable.some(function (requirementUpload) {
				if (requirementUpload.document.uniqueKey === uniqueKey) {
					this.document = requirementUpload.document;
					return true;
				}
			}, this);
			this.documentKind = 'requirementUpload';
			this.documentUniqueKey = uniqueKey;
			this.documentUniqueId =
				this.businessProcess.__id__ + '/' + this.documentKind + '/' + uniqueKey;
			return true;
		},
		view: require('../view/business-process-document')
	},
	'business-process/[0-9][a-z0-9]+/certificate/[a-z][a-z0-9-]*': {
		match: function (businessProcessId, uniqueKey) {
			var self = this;

			if (!matchBusinessProcess.call(self, businessProcessId)) return false;
			if (!this.businessProcess.isApproved) return false;

			uniqueKey = hyphenToCamel.call(uniqueKey);
			this.businessProcess.certificates.dataSnapshot.resolved.some(function (data) {
				if (data.uniqueKey === uniqueKey) {
					this.dataSnapshot = data;
					return true;
				}
			}, this);
			if (!this.dataSnapshot) return false;

			this.document = this.businessProcess.certificates.map[uniqueKey];
			this.documentKind = 'certificate';
			this.documentUniqueKey = uniqueKey;
			this.documentUniqueId =
				this.businessProcess.__id__ + '/' + this.documentKind + '/' + uniqueKey;
			return true;
		},
		view: require('../view/business-process-document')
	},
	'business-process/[0-9][a-z0-9]+/data': {
		match: matchBusinessProcess,
		view: require('../view/user-business-process-data')
	},
	'business-process/[0-9][a-z0-9]+/print-data': {
		match: matchBusinessProcess,
		view: require('../view/print-business-process-data')
	}
};
