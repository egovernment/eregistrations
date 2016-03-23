// Generic payment user page (Part A)

'use strict';

var _             = require('mano').i18n.bind('Registration')
  , errorMsg      = require('./_business-process-error-info').errorMsg;

exports._parent = require('./business-process-base');

exports['step-pay'] = { class: { 'step-active': true } };

exports.step = function () {
	var paymentReceiptUploads = this.businessProcess.paymentReceiptUploads;
	exports._paymentHeading(this);

	insert(errorMsg(this));
	exports._parent._optionalInfo(this);
	exports._paymentOptionalInfo(this);
	insert(div({ class: 'payment-total-amount' }, h2(_("Your fee is: ${ feeAmount }", {
		feeAmount: this.businessProcess.costs._totalAmount
	}))));

	div(
		{ class: ['disabler-range', _if(not(eq(this.businessProcess._guideProgress, 1)),
			'disabler-active')], id: 'documents-disabler-range' },
		div({ class: 'disabler' }),
		section(
			ul(
				{ class: 'sections-primary-list user-documents-upload' },
				list(paymentReceiptUploads.recentlyRejected,
					function (paymentUpload) {
						return li({ class: ['section-primary', _if(paymentUpload._isRejected,
								'user-documents-upload-rejected')] },
							paymentUpload.toDOMForm(document));
					}),
				list(paymentReceiptUploads.uploadable.not(paymentReceiptUploads.recentlyRejected),
					function (paymentUpload) {
						return li({ class: 'section-primary' },
							paymentUpload.toDOMForm(document));
					})
			)
		),
		exports._onlinePayments(this)
	);
	insert(_if(and(eq(this.businessProcess._guideProgress, 1),
		eq(this.businessProcess.costs._paymentProgress, 1)),
		div({ class: 'user-next-step-button' },
			a({ href: '/submission/' }, _("Continue to next step")))));
};

exports._paymentHeading = function (context) {
	var headingText = _("3 Pay the fees");

	return div(
		{ class: 'capital-first' },
		div(headingText[0]),
		div(
			h1(headingText.slice(1).trim()),
			p(_("Provide a proof of payment if you have paid at the bank or pay online directly here."))
		)
	);
};

// Displayed together with error info and 'global' optional info
exports._paymentOptionalInfo = Function.prototype;
exports._onlinePayments = Function.prototype;
