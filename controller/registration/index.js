// Controller for registration application (applies for both server and client).

'use strict';

var assign             = require('es5-ext/object/assign')
  , hyphenToCamel      = require('es5-ext/string/#/hyphen-to-camel')
  , some               = require('es5-ext/object/some')
  , validate           = require('mano/utils/validate')
  , customError        = require('es5-ext/error/custom')
  , _                  = require('mano').i18n.bind('Registration: Controller')
  , submit             = require('mano/utils/save')

  , re = /Requested$/;

// Common controller - login and password change.
module.exports = exports = assign(exports, require('../user'));

// Guide
exports.guide = {
	// Guide controller
	validate: function (data) {
		var normalizedData = validate.apply(this, arguments);
		var isRegistrationSelected = some(data, function (value, name) {
			return re.test(name) && value;
		});
		if (!isRegistrationSelected) {
			throw customError(_("You must select at least one request document"),
				'TOTAL_MISMATCH', {
					fieldName: 'requests'
				});
		}
		return normalizedData;
	},
	redirectUrl: '/forms/'
};

// Documents

exports['requirement-upload/[a-z][a-z0-9-]*'] = {
	match: function (uniqueKey) {
		var businessProcess = this.user.currentBusinessProcess;
		uniqueKey = hyphenToCamel.call(uniqueKey);
		return businessProcess.requirementUploads.applicable.some(function (requirementUpload) {
			if (requirementUpload.document.uniqueKey === uniqueKey) {
				this.requirementUpload = requirementUpload;
				return true;
			}
		}, this);
	},
	submit: function (data) {
		if (this.requirementUpload.status) this.requirementUpload.status = null;
		return submit.apply(this, arguments);
	}
};

// Payment

exports['payment-receipt-upload/[a-z][a-z0-9-]*'] = {
	match: function (key) {
		var businessProcess = this.user.currentBusinessProcess
		  , uploads = businessProcess.paymentReceiptUploads
		  , paymentReceiptUpload = uploads.map.get(hyphenToCamel.call(key));
		if (!paymentReceiptUpload) return false;
		if (!uploads.applicable.has(paymentReceiptUpload)) return;
		this.paymentReceiptUpload = paymentReceiptUpload;
		return true;
	},
	submit: function (data) {
		if (this.paymentReceiptUpload.status) this.paymentReceiptUpload.status = null;
		return submit.apply(this, arguments);
	}
};

// Submission

exports['application-submit'] = {
	validate: function (data) { return validate.call(this, data, { changedOnly: false }); },
	submit: function () {
		this.user.currentBusinessProcess.processingSteps.applicable.forEach(function (step) {
			if (step.status === 'sentBack') step.status = null;
		});
		submit.apply(this, arguments);
	}
};
