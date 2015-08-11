// Single payment revision view

'use strict';

var document = require('./_document'),
paymentForm,
_ = require('mano').i18n.bind('Official: Revision'),
camelToHyphen = require('es5-ext/string/#/camel-to-hyphen');

exports._parent = require('./user-base');
exports._match = 'document';

paymentForm = function (paymentReceiptUpload) {
	var revFail;
	return form(
		{ id: 'form-revision-payment-receipt-upload',
			action: '/form-revision-payment-receipt/' + paymentReceiptUpload.master.__id__ +
				'/' + camelToHyphen.call(paymentReceiptUpload.key) + '/',
			method: 'post', class: 'submitted-preview-form' },
		p(_("Uploaded payment receipt applies to following costs:")),
		ul({ class: 'user-guide-costs-list' },
				paymentReceiptUpload.costs, function (cost) {
				li(span({ class: 'user-guide-costs-list-label' }, cost.label),
					span(cost.amount));
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
		document(this.payment.document, paymentForm(this.payment));
	}
};
