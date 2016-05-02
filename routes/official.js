// Routes for the views

'use strict';

var hyphenToCamel        = require('es5-ext/string/#/hyphen-to-camel')
  , matchBusinessProcess = require('./utils/official-match-business-process');

module.exports = function (step) {
	if (!step) {
		throw new Error('No step provided for official route');
	}
	var match = matchBusinessProcess(step);
	return {
		// User routes
		profile: require('../view/user-profile'),

		// App routes
		'/': require('../view/business-processes-table'),
		'[0-9][a-z0-9]*': {
			match: match,
			view: require('../view/business-process-official-form')
		},
		'[0-9][a-z0-9]*/documents': {
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
			match: function (businessProcessId, docUniqueKey) {
				return match.call(this, businessProcessId).then(function (result) {
					if (!result) return false;
					docUniqueKey = hyphenToCamel.call(docUniqueKey);
					this.processingStep.requirementUploads.applicable.some(function (requirementUpload) {
						if (requirementUpload.document.uniqueKey === docUniqueKey) {
							this.document = requirementUpload.document;
							return true;
						}
					}, this);
					if (!this.document) return false;
					this.businessProcess.requirementUploads.dataSnapshot.resolved.some(function (data) {
						if (data.uniqueKey === docUniqueKey) {
							this.dataSnapshot = data;
							return true;
						}
					}, this);
					if (!this.dataSnapshot) {
						// If no snapshot we show document only if it's directed for review
						if (!this.processingStep.requirementUploads.processable) return false;
						if (!this.processingStep.requirementUploads.processable.has(this.document.owner)) {
							return false;
						}
						this.dataSnapshot = this.document.owner.enrichJSON(this.document.owner.toJSON());
					}
					this.documentKind = 'requirementUpload';
					this.documentUniqueId =
						this.processingStep.__id__ + '/' + this.documentKind + '/' + docUniqueKey;
					return true;
				}.bind(this));
			},
			view: require('../view/business-process-official-document')
		},
		'[0-9][a-z0-9]*/payment-receipts/[a-z][a-z0-9-]*': {
			match: function (businessProcessId, docUniqueKey) {
				return match.call(this, businessProcessId).then(function (result) {
					if (!result) return false;
					docUniqueKey = hyphenToCamel.call(docUniqueKey);
					var paymentReceiptUpload = this.businessProcess.paymentReceiptUploads.map[docUniqueKey];
					if (!paymentReceiptUpload) return false;
					if (!this.processingStep.paymentReceiptUploads.applicable.has(paymentReceiptUpload)) {
						return false;
					}

					this.document = paymentReceiptUpload.document;
					this.businessProcess.paymentReceiptUploads.dataSnapshot.resolved.some(function (data) {
						if (data.uniqueKey === docUniqueKey) {
							this.dataSnapshot = data;
							return true;
						}
					}, this);
					if (!this.dataSnapshot) {
						// If no snapshot we show document only if it's directed for review
						if (!this.processingStep.paymentReceiptUploads.processable) return false;
						if (!this.processingStep.paymentReceiptUploads.processable.has(paymentReceiptUpload)) {
							return false;
						}
						this.dataSnapshot = this.document.owner.enrichJSON(this.document.owner.toJSON());
					}
					this.documentKind = 'paymentReceiptUpload';
					this.documentUniqueId =
						this.processingStep.__id__ + '/' + this.documentKind + '/' + docUniqueKey;
					return true;
				}.bind(this));
			},
			view: require('../view/business-process-official-payment')
		},
		'[0-9][a-z0-9]*/certificates/[a-z][a-z0-9-]*': {
			match: function (businessProcessId, docUniqueKey) {
				return match.call(this, businessProcessId).then(function (result) {
					if (!result) return false;
					docUniqueKey = hyphenToCamel.call(docUniqueKey);
					var certificate = this.businessProcess.certificates.map[docUniqueKey];
					if (!certificate) return false;
					if (!this.processingStep.certificates.released.has(certificate)) {
						return false;
					}

					this.document = certificate;
					if (this.businessProcess.isClosed) {
						this.businessProcess.certificates.dataSnapshot.resolved.some(function (data) {
							if (data.uniqueKey === docUniqueKey) {
								this.dataSnapshot = data;
								return true;
							}
						}, this);
						if (!this.dataSnapshot) return false;
					}

					this.documentKind = 'certificate';
					this.documentUniqueId =
						this.processingStep.__id__ + '/' + this.documentKind + '/' + docUniqueKey;
					return true;
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
