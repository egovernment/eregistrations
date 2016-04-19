// Routes for the views.
'use strict';

var hyphenToCamel = require('es5-ext/string/#/hyphen-to-camel')
  , matchBusinessProcess = require('./utils/official-match-business-process');

module.exports = function (step) {
	if (!step) {
		throw new Error('No step provided for official route');
	}
	var match = matchBusinessProcess(step);
	return {
		profile: require('eregistrations/view/user-profile'),
		'/': require('eregistrations/view/business-processes-table'),
		'print-business-processes-list': require('eregistrations/view/print-business-processes-table'),
		'[0-9][a-z0-9]*': {
			match: match,
			view: require('eregistrations/view/business-process-official-form')
		},
		'[0-9][a-z0-9]*/print-request-history': {
			match: match,
			view: require('eregistrations/view/print-business-process-status-log')
		},
		'[0-9][a-z0-9]*/data-print': {
			match: match,
			view: require('eregistrations/view/print-business-process-data')
		},
		'[0-9][a-z0-9]*/documents-and-data': {
			match: match,
			view: require('eregistrations/view/business-process-official-data')
		},
		'[0-9][a-z0-9]*/document/[a-z][a-z0-9-]*': {
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
						// If no snapshot we show it only if it's issued for review
						if (!this.processingStep.requirementUploads.processable) return false;
						if (!this.processingStep.requirementUploads.processable.has(this.document.owner)) {
							return false;
						}
					}
					this.kind = 'requirementUpload';
					this.documentUniqueId = this.processingStep.__id__ + '/' + this.kind + '/' + docUniqueKey;
					return true;
				}.bind(this));
			},
			view: require('eregistrations/view/business-process-document')
		},
		'[0-9][a-z0-9]*/receipt/[a-z][a-z0-9-]*': {
			match: function (businessProcessId, docUniqueKey) {
				return match.call(this, businessProcessId).then(function (result) {
					if (!result) return false;
					var paymentReceiptUpload =
						this.businessProcess.paymentReceiptUploads.map.get(hyphenToCamel.call(docUniqueKey));
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
						// If no snapshot we show it only if it's issued for review
						if (!this.processingStep.paymentReceiptUploads.processable) return false;
						if (!this.processingStep.paymentReceiptUploads.processable.has(paymentReceiptUpload)) {
							return false;
						}
					}
					this.kind = 'paymentReceiptUpload';
					this.documentUniqueId = this.processingStep.__id__ + '/' + this.kind + '/' + docUniqueKey;
					return true;
				}.bind(this));
			},
			view: require('eregistrations/view/business-process-document')
		},
		'[0-9][a-z0-9]*/certificate/[a-z][a-z0-9-]*': {
			match: function (businessProcessId, docUniqueKey) {
				return match.call(this, businessProcessId).then(function (result) {
					if (!result) return false;

					var certificate =
						this.businessProcess.certificates.map.get(hyphenToCamel.call(docUniqueKey));
					if (!certificate) return false;
					if (!this.processingStep.certificates.uploaded.has(certificate)) {
						return false;
					}

					this.document = certificate;
					this.businessProcess.certificates.dataSnapshot.resolved.some(function (data) {
						if (data.uniqueKey === docUniqueKey) {
							this.dataSnapshot = data;
							return true;
						}
					}, this);
					this.kind = 'certificate';
					this.documentUniqueId = this.processingStep.__id__ + '/' + this.kind + '/' + docUniqueKey;
					return true;
				}.bind(this));
			},
			view: require('eregistrations/view/business-process-document')
		}
	};
};
