// Generic documents user page (Part A)

'use strict';

var _                    = require('mano').i18n.bind('Registration')
  , disableConditionally = require('./components/disable-conditionally')
  , errorMsg             = require('./_business-process-error-info').errorMsg
  , infoMsg              = require('./_business-process-optional-info').infoMsg;

exports._parent = require('./business-process-base');

exports['step-documents'] = { class: { 'step-active': true } };

exports.step = function () {
	var businessProcess    = this.businessProcess
	  , requirementUploads = businessProcess.requirementUploads
	  , guideProgress      = businessProcess._guideProgress;

	exports._documentsHeading(this);

	insert(errorMsg(this));
	insert(infoMsg(this));
	insert(exports._optionalInfo(this));

	insert(disableConditionally(
		section(
			ul(
				{ class: 'sections-primary-list user-documents-upload' },
				list(requirementUploads.recentlyRejected, function (requirementUpload) {
					return li({ class: ['section-primary', _if(requirementUpload._isRejected,
						'user-documents-upload-rejected')] },
						requirementUpload.toDOMForm(document, { viewContext: this }));
				}.bind(this)),
				list(requirementUploads.applicable.not(requirementUploads.recentlyRejected),
					function (requirementUpload) {
						return li({ class: 'section-primary' }, requirementUpload.toDOMForm(document,
							{ viewContext: this }));
					}.bind(this)),
				exports._extraDocuments(this)
			)
		),
		not(eq(guideProgress, 1)),
		{
			forcedState: exports._forcedState(this),
			id: 'documents-disabler-range'
		}
	));

	insert(_if(and(eq(guideProgress, 1), eq(requirementUploads._progress, 1)),
		div({ class: 'user-next-step-button' },
			a({ href: _if(not(eq(businessProcess.costs._paymentWeight, 0)), '/pay/',
				'/submission/') }, _("Continue to next step")))));
};

// Resolves forced disabler state of the documents page
exports._forcedState = Function.prototype;

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

// Displayed together with error info and 'global' optional info
exports._optionalInfo = Function.prototype;
exports._extraDocuments = Function.prototype;
