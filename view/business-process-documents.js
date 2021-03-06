// Generic documents user page (Part A)

'use strict';

var _        = require('mano').i18n.bind('View: Business Process')
  , errorMsg = require('./components/business-process-error-info').errorMsg
  , infoMsg  = require('./components/business-process-optional-info').infoMsg;

exports._parent = require('./business-process-base');

exports['step-documents'] = { class: { 'step-active': true } };

exports.step = function () {
	var businessProcess         = this.businessProcess
	  , requirementUploads      = businessProcess.requirementUploads
	  , recentlyRejectedUploads = requirementUploads.recentlyRejected
	  , processableUploads      = requirementUploads.userProcessable.not(recentlyRejectedUploads)
	  , guideProgress           = businessProcess._guideProgress;

	var disabledUploads = requirementUploads.applicable.not(processableUploads)
		.not(recentlyRejectedUploads);

	exports._documentsHeading.call(this);

	insert(errorMsg(this));
	insert(infoMsg(this));
	insert(exports._optionalInfo.call(this));

	disabler(
		{ id: 'documents-disabler-range' },
		exports._disableCondition.call(this),
		section(
			ul(
				{ class: 'sections-primary-list user-documents-upload' },
				list(recentlyRejectedUploads, function (requirementUpload) {
					return li({ class: ['section-primary', _if(requirementUpload._isRejected,
						'user-documents-upload-rejected')] },
						requirementUpload.toDOMForm(document, { viewContext: this }));
				}.bind(this)),
				list(processableUploads, function (requirementUpload) {
					return li({ class: 'section-primary' }, requirementUpload.toDOMForm(document,
						{ viewContext: this }));
				}.bind(this)),
				list(disabledUploads, function (requirementUpload) {
					return li({ class: 'section-primary' }, disabler(true,
						requirementUpload.toDOMForm(document, { viewContext: this })));
				}.bind(this)),
				exports._extraDocuments.call(this)
			)
		)
	);

	insert(_if(and(eq(guideProgress, 1), eq(requirementUploads._progress, 1)),
		div({ class: 'user-next-step-button' },
			a({ href: _if(not(eq(businessProcess.costs._paymentWeight, 0)), '/pay/',
				'/submission/') }, _("Continue to next step")))));
};

exports._disableCondition = function () {
	return not(eq(this.businessProcess._guideProgress, 1));
};

exports._documentsHeading = function () {
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

// Displayed together with error info and 'global' optional info
exports._optionalInfo = Function.prototype;
exports._extraDocuments = Function.prototype;
