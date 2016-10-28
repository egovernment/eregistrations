// Controller for registration application (applies for both server and client).

'use strict';

var assign        = require('es5-ext/object/assign')
  , hyphenToCamel = require('es5-ext/string/#/hyphen-to-camel')
  , isEmpty       = require('es5-ext/object/is-empty')
  , some          = require('es5-ext/object/some')
  , validate      = require('mano/utils/validate')
  , customError   = require('es5-ext/error/custom')
  , _             = require('mano').i18n.bind('Registration: Controller')
  , submit        = require('mano/utils/save')

  , re = /\/isRequested$/;

// Common controller - login and password change.
module.exports = exports = assign(exports, require('../user'), require('../demo-user/index')());

// Guide
exports.guide = {
	// Guide controller
	validate: function (data) {
		var normalizedData = validate.apply(this, arguments);
		var isRegistrationSelected = some(data, function (value, name) {
			return re.test(name) && Array.isArray(value);
		});
		if (!isRegistrationSelected) {
			throw customError(_("You must select at least one request document"),
				'TOTAL_MISMATCH', {
					fieldName: 'requests'
				});
		}
		return normalizedData;
	},
	redirectUrl: function () {
		if (this.businessProcess.guideProgress < 1) {
			return '/';
		}
		return '/forms/';
	}
};

// Documents

exports['requirement-upload/[a-z][a-z0-9-]*'] = {
	match: function (uniqueKey) {
		var businessProcess = this.businessProcess;
		uniqueKey = hyphenToCamel.call(uniqueKey);
		return businessProcess.requirementUploads.applicable.some(function (requirementUpload) {
			if (requirementUpload.document.uniqueKey === uniqueKey) {
				this.requirementUpload = requirementUpload;
				return true;
			}
		}, this);
	},
	validate: function (data) {
		/**
		 * We have a use case for providing together with
		 * default file controls a field that requires such setting
		 * (e.g. signedDocument.isUpToDateByUser)
		 */
		return validate(data, { changedOnly: false });
	},
	submit: function (data) {
		// As form is set with "auto submit", the submission may be triggered not only
		// by user update but also by data update coming from the server.
		// In the later case we don't want to introduce side effects (reset revision status etc.)
		if (isEmpty(data)) return;
		if (this.requirementUpload.status) this.requirementUpload.delete('status');
		if (this.user !== this.requirementUpload.uploadedBy) {
			this.requirementUpload.uploadedBy = this.user;
		}
		return submit.apply(this, arguments);
	}
};

// Payment

exports['payment-receipt-upload/[a-z][a-z0-9-]*'] = {
	match: function (key) {
		var businessProcess = this.businessProcess
		  , uploads = businessProcess.paymentReceiptUploads
		  , paymentReceiptUpload = uploads.map.get(hyphenToCamel.call(key));
		if (!paymentReceiptUpload) return false;
		if (!uploads.applicable.has(paymentReceiptUpload)) return false;
		this.paymentReceiptUpload = paymentReceiptUpload;
		return true;
	},
	submit: function (data) {
		// As form is set with "auto submit", the submission may be triggered not only
		// by user update but also by data update coming from the server.
		// In the later case we don't want to introduce side effects (reset revision status etc.)
		if (isEmpty(data)) return;
		if (this.paymentReceiptUpload.status) this.paymentReceiptUpload.delete('status');
		if (this.user !== this.paymentReceiptUpload.uploadedBy) {
			this.paymentReceiptUpload.uploadedBy = this.user;
		}
		return submit.apply(this, arguments);
	}
};

// Submission

exports['application-submit'] = {
	validate: function (data) {
		if (this.user.isDemo) throw customError('Cannot submit in demo mode', 'DEMO_MODE_SUBMISSION');
		return validate.apply(this, arguments);
	},
	submit: function (data) {
		var businessProcess = this.businessProcess;

		if (!businessProcess.isSubmitted) {
			if (this.manager) {
				businessProcess.submitter = this.manager;
				businessProcess.submitterType = 'manager';
			} else {
				businessProcess.submitter = this.user;
				businessProcess.submitterType = 'user';
			}
		}

		return submit.apply(this, arguments);
	}
};
