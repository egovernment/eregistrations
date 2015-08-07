// Single document revision view

'use strict';

var _ = require('mano').i18n.bind('Official: Revision');

module.exports = function (paymentReceiptUpload) {
	var revFail, revFailOther;
	return form(
		{ id: 'revision-documento', action: url('revision', ''),
			method: 'post', class: 'submitted-preview-form' },
		ul(
			{ class: 'form-elements' },
			li(div({ class: 'input' },
				_if(paymentReceiptUpload._correspondingCost, function () {
					return label({ class: 'input-aside' },
						input({ dbjs: paymentReceiptUpload.correspondingCost._isPaid, type: 'checkbox' }), " ",
						span(paymentReceiptUpload.correspondingCost.receiptLabel, ": ",
							paymentReceiptUpload.correspondingCost._amount));
				})
				)),
			li(div({ class: 'input' }, input({ dbjs: paymentReceiptUpload._status }))),
			li(
				revFail = div({ class: 'input' },
					input({ dbjs: paymentReceiptUpload._rejectReasonTypes, type: 'checkbox' }))
			),
			li(
				revFailOther = div({ class: 'official-form-document-revision-reject-reason' },
					field({ dbjs: paymentReceiptUpload._rejectReasonMemo }))
			)
		),
		p(input({ class: 'enviar-btn', type: 'submit', value: _("Save") })),
		legacy('radioMatch', 'revision-documento', paymentReceiptUpload.__id__ + '/rejectReasonTypes', {
			other: revFailOther.getId()
		}),
		legacy('radioMatch', 'revision-documento', paymentReceiptUpload.__id__ + '/status', {
			invalid: revFail.getId()
		})
	);
};
