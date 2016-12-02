// Controller for Official Revision application (applies for both server and client).

'use strict';

var assign               = require('es5-ext/object/assign')
  , normalizeOptions     = require('es5-ext/object/normalize-options')
  , commonController     = require('../user')
  , matchBusinessProcess = require('../utils/official-matcher')
  , unpauseMatcher       = require('../utils/official-unpause-matcher');

module.exports = function (/*options*/) {
	var options    = normalizeOptions(arguments[0])
	  , stepName   = options.stepName || 'frontDesk'
	  , matcher    = options.matcher || matchBusinessProcess
	  , controller = {};

	// Common controller - login and password change.
	assign(controller, commonController);

	// Approve registration.
	controller['[0-9][a-z0-9]+/approve'] = {
		match: function (businessProcessId) {
			if (!matcher.call(this, businessProcessId, stepName)) return;
			return this.processingStep.approvalProgress === 1;
		},
		validate: Function.prototype,
		submit: function () {
			this.processingStep.processor      = this.user;
			this.processingStep.officialStatus = 'approved';
		},
		redirectUrl: '/'
	};

	// Approve uploads and certs handing
	controller['[0-9][a-z0-9]+/validate-docs'] = {
		formHtmlId: 'docs-validation',
		match: function (businessProcessId) {
			return matcher.call(this, businessProcessId, stepName);
		}
	};

	controller['[0-9][a-z0-9]+/pause'] = {
		match: function (businessProcessId) {
			if (!matcher.call(this, businessProcessId, stepName)) return false;
			return this.processingStep.pauseProgress === 1;
		},
		submit: function () {
			this.processingStep.processor = this.user;
			this.processingStep.officialStatus = 'paused';
		}
	};

	controller['[0-9][a-z0-9]+/unpause'] = {
		match: function (businessProcessId) {
			return unpauseMatcher.call(this, businessProcessId, stepName);
		},
		submit: function () {
			this.processingStep.delete('officialStatus');
			this.processingStep.delete('status');
		}
	};

	return controller;
};
