// Generic payment user page (Part A)

'use strict';

var _        = require('mano').i18n.bind('View: Business Process')
  , errorMsg = require('./components/business-process-error-info').errorMsg
  , infoMsg  = require('./components/business-process-optional-info').infoMsg;

exports._parent = require('./business-process-base');

exports['step-pay'] = { class: { 'step-active': true } };

exports.step = function () {
	var businessProcess       = this.businessProcess
	  , paymentReceiptUploads = businessProcess.paymentReceiptUploads
	  , guideProgress         = businessProcess._guideProgress;

	exports._paymentHeading(this);

	insert(errorMsg(this));
	insert(infoMsg(this));
	insert(exports._optionalInfo(this));

	insert(div({ class: 'payment-total-amount' }, h2(_("Your fee is: ${ feeAmount }", {
		feeAmount: businessProcess.costs._totalAmount
	}))));

	disabler(
		{ id: 'documents-disabler-range' },
		exports._disableCondition(this),
		section(
			ul(
				{ class: 'sections-primary-list user-documents-upload' },
				list(paymentReceiptUploads.recentlyRejected,
					function (paymentUpload) {
						return li({ class: ['section-primary', _if(paymentUpload._isRejected,
								'user-documents-upload-rejected')] },
							paymentUpload.toDOMForm(document, { viewContext: this }));
					}),
				list(paymentReceiptUploads.uploadable.not(paymentReceiptUploads.recentlyRejected),
					function (paymentUpload) {
						return li({ class: 'section-primary' },
							paymentUpload.toDOMForm(document, { viewContext: this }));
					})
			)
		),
		exports._onlinePayments(this)
	);

	insert(_if(and(eq(guideProgress, 1),
		eq(businessProcess.costs._paymentProgress, 1)),
		div({ class: 'user-next-step-button' },
			a({ href: '/submission/' }, _("Continue to next step")))));
};

exports._disableCondition = function (context) {
	return not(eq(context.businessProcess._guideProgress, 1));
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
exports._optionalInfo = Function.prototype;
exports._onlinePayments = Function.prototype;
