// Single payment revision view

'use strict';

var _              = require('mano').i18n.bind('Official: Revision')
  , camelToHyphen  = require('es5-ext/string/#/camel-to-hyphen')
  , renderDocument = require('./_business-process-document')
  , disableStep    = require('./components/disable-processing-step')

  , paymentForm;

exports._parent = require('./user-base');
exports._match = 'document';

paymentForm = function (paymentReceiptUpload) {
	var revFail;
	return form(
		{ id: 'form-revision-payment-receipt-upload',
			action: '/form-revision-payment-receipt-upload/' + paymentReceiptUpload.master.__id__ +
				'/' + camelToHyphen.call(paymentReceiptUpload.key) + '/',
			method: 'post', class: 'submitted-preview-form' },
		p(_("Uploaded payment receipt applies to following costs:")),
		ul({ class: 'business-process-costs-list' },
				paymentReceiptUpload.applicableCosts, function (cost) {
				li(span({ class: 'business-process-costs-list-label' }, cost._label),
					span(cost._amount));
			}),
		ul(
			{ class: 'form-elements' },
			li(div({ class: 'input' }, input({ dbjs: paymentReceiptUpload._status }))),
			li(
				revFail = div({ class: 'official-form-document-revision-reject-reason' },
					field({ dbjs: paymentReceiptUpload._rejectReasonMemo }))
			)
		),
		p(input({ type: 'submit', value: _("Save") })),
		legacy('radioMatch', 'form-revision-payment-receipt-upload',
			paymentReceiptUpload.__id__ + '/status', { invalid: revFail.getId() })
	);
};

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		insert(renderDocument(this,
			_if(this.processingStep.requirementUploads.processable._has(this.document.owner),
				disableStep(this.processingStep, paymentForm(this.document.owner)))));
	}
};
