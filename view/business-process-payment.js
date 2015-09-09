// Generic payment user page (Part A)

'use strict';

var camelToHyphen = require('es5-ext/string/#/camel-to-hyphen')
  , _             = require('mano').i18n.bind('Registration')
  , errorMsg      = require('./_business-process-error-info').errorMsg

  , _d = _;

exports._parent = require('./business-process-base');

exports['step-pay'] = { class: { 'step-active': true } };

exports.step = function () {
	exports._paymentHeading(this);

	insert(errorMsg(this));
	insert(div({ class: 'payment-total-amount' }, h2(_("Your fee is"), ': ',
		this.businessProcess.costs._totalAmount)));

	div(
		{ class: ['disabler-range', _if(not(eq(this.businessProcess._guideProgress, 1)),
				'disabler-active')], id: 'documents-disabler-range' },
		section(
			ul(
				{ class: 'sections-primary-list user-documents-upload' },
				this.businessProcess.paymentReceiptUploads.applicable,
				function (paymentUpload) {
					return li({ class: 'section-primary' },
						form({ action: '/payment-receipt-upload/' + camelToHyphen.call(paymentUpload.key) + '/',
							method: 'post', enctype: 'multipart/form-data', autoSubmit: true },
							div(
								h2(_d(paymentUpload.document.label, { user: paymentUpload.master })),
								paymentUpload.document.legend &&
									small(mdi(_d(paymentUpload.document.legend,
										{ user: paymentUpload.master }))),
								hr(),
								input({ dbjs: paymentUpload.document.files._map, label: true }),
								p({ class: 'submit' }, input({ type: 'submit', value: _("Submit") })),
								p({ class: 'section-primary-scroll-top' },
										a({ onclick: 'window.scroll(0, 0)' },
											span({ class: 'fa fa-arrow-up' }, _("Back to top"))))
							))
						);
				}
			)
		),
		exports._onlinePayments(this),
		div({ class: 'disabler' })
	);
	insert(_if(eq(this.businessProcess.costs._paymentProgress, 1),
		div({ class: 'user-next-step-button' },
			a({ href: '/submission/' }, _("Continue to next step")))));
};

exports._paymentHeading = Function.prototype;
exports._onlinePayments = Function.prototype;
