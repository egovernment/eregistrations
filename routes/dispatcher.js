// Routes for the views.
'use strict';

var matchBusinessProcess      = require('./utils/official-match-business-process')
  , matchRequirementUpload    = require('./utils/match-requirement-upload')('processingStep')
  , matchPaymentReceiptUpload = require('./utils/match-payment-receipt-upload')('processingStep')
  , matchCertificate          = require('./utils/match-certificate')('processingStep', 'uploaded');

module.exports = function (step) {
	if (!step) {
		throw new Error('No step provided for official route');
	}
	var match = matchBusinessProcess(step);
	return {
		// User routes
		profile: require('../view/user-profile'),

		// App routes
		'/': {
			view: require('../view/dispatcher-assignments-panel')
		},
		'[0-9][a-z0-9]*': {
			match: match,
			decorateContext: function () {
				var requirementUpload = this.businessProcess.requirementUploads.applicable.first;

				if (requirementUpload) {
					this.document = requirementUpload.document;
				}
			},
			view: require('../view/business-process-official-document')
		},
		'[0-9][a-z0-9]*/documents/[a-z][a-z0-9-]*': {
			match: function (businessProcessId, documentUniqueKey) {
				return match.call(this, businessProcessId).then(function (result) {
					if (!result) return false;

					return matchRequirementUpload.call(this, documentUniqueKey);
				}.bind(this));
			},
			view: require('../view/business-process-official-document')
		},
		'[0-9][a-z0-9]*/payment-receipts/[a-z][a-z0-9-]*': {
			match: function (businessProcessId, receiptKey) {
				return match.call(this, businessProcessId).then(function (result) {
					if (!result) return false;

					return matchPaymentReceiptUpload.call(this, receiptKey);
				}.bind(this));
			},
			view: require('../view/business-process-official-payment')
		},
		'[0-9][a-z0-9]*/certificates/[a-z][a-z0-9-]*': {
			match: function (businessProcessId, certificateKey) {

				return match.call(this, businessProcessId).then(function (result) {
					if (!result) return false;

					return matchCertificate.call(this, certificateKey);
				}.bind(this));
			},
			view: require('../view/business-process-official-certificate')
		},
		'[0-9][a-z0-9]*/data': {
			match: match,
			view: require('../view/business-process-official-data')
		},

		// Print routes
		'print-business-processes-list': require('../view/print-business-processes-table'),
		'[0-9][a-z0-9]*/print-request-history': {
			match: match,
			view: require('../view/print-business-process-status-log')
		},
		'[0-9][a-z0-9]*/data-print': {
			match: match,
			view: require('../view/print-business-process-data')
		}
	};
};
