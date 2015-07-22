// Generic documents user page (Part A)

'use strict';

var _  = require('mano').i18n.bind('Registration');

exports._parent = require('./user-registration-base');

exports['step-documents'] = { class: { 'step-active': true } };

exports.step = function () {
	exports._documentsHeading();

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
								h2(requirementUpload.document.label),
								small(requirementUpload.document.legend),
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
