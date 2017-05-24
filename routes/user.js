// Routes for the views.

'use strict';

var hyphenToCamel               = require('es5-ext/string/#/hyphen-to-camel')
  , db                          = require('mano').db
  , matchUpload                 = require('./utils/user-match-upload')
  , matchFirstRequirementUpload = require('./utils/user-match-first-requirement-upload')
  , matchCertificate            = require('./utils/user-match-certificate');

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
		match: function (businessProcessId) {
			if (!matchBusinessProcess.call(this, businessProcessId)) return false;
			return matchFirstRequirementUpload.call(this);
		},
		view: require('../view/user-business-process-document')
	},
	'business-process/[0-9][a-z0-9]+/documents/[a-z][a-z0-9-]*': {
		match: function (businessProcessId, uniqueKey) {
			if (!matchBusinessProcess.call(this, businessProcessId)) return false;

			uniqueKey = hyphenToCamel.call(uniqueKey);
			var firstUpload = this.businessProcess.requirementUploads.dataSnapshot.resolved[0];
			if (firstUpload && (firstUpload.uniqueKey === uniqueKey)) return false;
			return matchUpload.call(this, 'requirementUpload', uniqueKey);
		},
		view: require('../view/user-business-process-document')
	},
	'business-process/[0-9][a-z0-9]+/certificates/[a-z][a-z0-9-]*': {
		match: function (businessProcessId, uniqueKey) {
			if (!matchBusinessProcess.call(this, businessProcessId)) return false;
			if (!this.businessProcess.isApproved) return false;
			return matchCertificate.call(this, hyphenToCamel.call(uniqueKey));
		},
		view: require('../view/user-business-process-certificate')
	},
	'business-process/[0-9][a-z0-9]+/data': {
		match: matchBusinessProcess,
		decorateContext: function () {
			this.dataSnapshot = this.businessProcess.dataForms.dataSnapshot.resolved;
		},
		view: require('../view/user-business-process-data')
	}
};
