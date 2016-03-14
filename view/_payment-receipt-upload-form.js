'use strict';
var camelToHyphen = require('es5-ext/string/#/camel-to-hyphen')
  , _  = require('mano').i18n.bind('Registration')
  , _d = _;

module.exports = function (paymentUpload) {

	return form({ action: '/payment-receipt-upload/' + camelToHyphen.call(paymentUpload.key) + '/',
		method: 'post', enctype: 'multipart/form-data', autoSubmit: true },
		h2(_d(paymentUpload.document.label, { user: paymentUpload.master })),
		paymentUpload.document.legend &&
		small(mdi(_d(paymentUpload.document.legend,
			{ user: paymentUpload.master }))),
		input({ dbjs: paymentUpload.document.files._map, label: true }),
		p({ class: 'submit' }, input({ type: 'submit', value: _("Submit") })),
		p({ class: 'section-primary-scroll-top' },
			a({ onclick: 'window.scroll(0, 0)' },
				span({ class: 'fa fa-arrow-up' }, _("Back to top")))));
};
