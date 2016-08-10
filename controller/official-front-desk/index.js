// Controller for Official Revision application (applies for both server and client).

'use strict';

var assign               = require('es5-ext/object/assign')
  , normalizeOptions     = require('es5-ext/object/normalize-options')
  , commonController     = require('../user')
  , matchBusinessProcess = require('../utils/official-matcher');

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

	return controller;
};
