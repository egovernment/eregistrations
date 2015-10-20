// Generic documents user page (Part A)

'use strict';

var _             = require('mano').i18n.bind('Registration')
  , errorMsg      = require('./_business-process-error-info').errorMsg;

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
					return li({ class: 'section-primary' }, requirementUpload.toDOMForm(document));
				}.bind(this)
			)
		),
		div({ class: 'disabler' })
	);
	insert(_if(eq(this.businessProcess.requirementUploads._progress, 1),
		div({ class: 'user-next-step-button' },
			a({ href: _if(not(eq(this.businessProcess.costs._paymentWeight, 0)), '/pay/',
				'/submission/') }, _("Continue to next step")))));
};

exports._documentsHeading = Function.prototype;
