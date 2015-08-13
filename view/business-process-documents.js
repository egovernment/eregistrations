// Generic documents user page (Part A)

'use strict';

var camelToHyphen = require('es5-ext/string/#/camel-to-hyphen')
  , _             = require('mano').i18n.bind('Registration')
  , errorMsg      = require('./_business-process-error-info').errorMsg

  , _d = _;

exports._parent = require('./business-process-base');

exports['step-documents'] = { class: { 'step-active': true } };

exports.step = function () {
	exports._documentsHeading();

	insert(errorMsg(this));

	div(
		{ class: ['disabler-range', _if(not(eq(this.businessProcess._guideProgress, 1)),
				'disabler-active')], id: 'documents-disabler-range' },
		section(
			ul(
				{ class: 'sections-primary-list user-documents-upload' },
				this.businessProcess.requirementUploads.applicable,
				function (requirementUpload) {
					return li({ class: 'section-primary' },
						form({ action: '/requirement-upload/' +
							camelToHyphen.call(requirementUpload.document.uniqueKey) + '/', method: 'post',
								enctype: 'multipart/form-data', autoSubmit: true },
							div(
								h2(_d(requirementUpload.document.label, { user: requirementUpload.master })),
								requirementUpload.document.legend &&
									small(mdi(_d(requirementUpload.document.legend,
										{ user: requirementUpload.master }))),
								hr(),
								input({ dbjs: requirementUpload.document.files._map, label: true }),
								p({ class: 'submit' }, input({ type: 'submit', value: _("Submit") })),
								p({ class: 'section-primary-scroll-top' },
										a({ onclick: 'window.scroll(0, 0)' },
											span({ class: 'fa fa-arrow-up' }, _("Back to top"))))
							))
						);
				}
			)
		),
		div({ class: 'disabler' })
	);
	insert(_if(eq(this.businessProcess.requirementUploads._progress, 1),
		div({ class: 'user-next-step-button' },
			a({ href: _if(not(eq(this.businessProcess._paymentWeight, 0)), '/pay/', '/submission/') },
				_("Continue to next step")))));
};

exports._documentsHeading = Function.prototype;
