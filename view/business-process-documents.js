// Generic documents user page (Part A)

'use strict';

var _             = require('mano').i18n.bind('Registration')
  , errorMsg      = require('./_business-process-error-info').errorMsg;

exports._parent = require('./business-process-base');

exports['step-documents'] = { class: { 'step-active': true } };

exports.step = function () {
	var requirementUploads = this.businessProcess.requirementUploads;

	exports._documentsHeading(this);

	insert(errorMsg(this));

	div(
		{ class: ['disabler-range', _if(not(eq(this.businessProcess._guideProgress, 1)),
				'disabler-active')], id: 'documents-disabler-range' },
		div({ class: 'disabler' }),
		section(
			ul(
				{ class: 'sections-primary-list user-documents-upload' },
				list(requirementUploads.recentlyRejected, function (requirementUpload) {
					return li({ class: ['section-primary', _if(requirementUpload._isRejected,
						'user-documents-upload-rejected')] },
						requirementUpload.toDOMForm(document));
				}),
				list(requirementUploads.applicable.not(requirementUploads.recentlyRejected),
					function (requirementUpload) {
						return li({ class: 'section-primary' }, requirementUpload.toDOMForm(document));
					}),
				exports._extraDocuments(this)
			)
		)
	);
	insert(_if(and(eq(this.businessProcess._guideProgress, 1), eq(requirementUploads._progress, 1)),
		div({ class: 'user-next-step-button' },
			a({ href: _if(not(eq(this.businessProcess.costs._paymentWeight, 0)), '/pay/',
				'/submission/') }, _("Continue to next step")))));
};

exports._documentsHeading = function (context) {
	var headingText = _("2 Upload the documents");

	return div(
		{ class: 'capital-first' },
		div(headingText[0]),
		div(
			h1(headingText.slice(1).trim()),
			p(_("Upload all the mandatory documents."))
		)
	);
};

exports._extraDocuments = Function.prototype;
