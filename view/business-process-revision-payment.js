// Single payment revision view

'use strict';

var document = require('./_payment'),
paymentForm,
_ = require('mano').i18n.bind('Official: Revision'),
camelToHyphen = require('es5-ext/string/#/camel-to-hyphen');

exports._parent = require('./user-base');

paymentForm = function (paymentReceiptUpload) {
	var revFail;
	return form(
		{ id: 'form-revision-payment-receipt',
			action: '/form-revision-payment-receipt/' + paymentReceiptUpload.__id__ +
				'/' + camelToHyphen.call(paymentReceiptUpload.document.uniqueKey) + '/',
			method: 'post', class: 'submitted-preview-form' },
		ul(paymentReceiptUpload.costs, function (cost) {
			li(cost.label, " ", cost.amount);
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
		legacy('radioMatch', 'form-revision-payment-receipt', paymentReceiptUpload.__id__ + '/status', {
			invalid: revFail.getId()
		})
	);
};

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		document(this.payment.document, paymentForm(this.payment));
	}
};
