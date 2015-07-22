// Generic documents user page (Part A)

'use strict';

var _  = require('mano').i18n.bind('Registration'),
errorMsg = require('./_user-registration-error-info').errorMsg,
_d = _;

exports._parent = require('./user-registration-base');

exports['step-documents'] = { class: { 'step-active': true } };

exports.step = function () {
	exports._documentsHeading();

	insert(errorMsg(exports._sentBackInformation, this.businessProcess, this));

	div(
		{ class: ['disabler-range', _if(not(eq(this.businessProcess.requirementUploads._progress, 1)),
				'disabler-active')], id: 'documents-disabler-range' },
		section(
			ul(
				{ class: 'sections-primary-list user-documents-upload' },
				this.businessProcess.requirementUploads.applicable,
				function (requirementUpload) {
					console.log(requirementUpload.document._files);
					return li({ class: 'section-primary' },
						form({ class: 'auto-submit' },
							div(
								h2(_d(requirementUpload.document.label, { user: requirementUpload.master })),
								requirementUpload.document.legend &&
									small(mdi(_d(requirementUpload.document.legend,
										{ user: requirementUpload.master }))),
								hr(),
								input({ dbjs: requirementUpload.document.files._map, label: true })
							))
						);
				}
			)
		),
		div({ class: 'disabler' })
	);
	insert(_if(eq(this.businessProcess.requirementUploads._progress, 1),
		div({ class: 'user-next-step-button' },
			a({ href: '/submission/' }, _("Continue to next step")))));
};

exports._documentsHeading = Function.prototype;
