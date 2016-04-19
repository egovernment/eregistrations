// Single document revision view

'use strict';

var _                     = require('mano').i18n.bind('Official: Revision')
  , camelToHyphen         = require('es5-ext/string/#/camel-to-hyphen')
  , reactiveSibling       = require('../utils/reactive-sibling')
  , renderDocument        = require('./components/business-process-document-preview')
  , renderDocumentHistory = require('./components/business-process-document-history')
  , generateSections      = require('./components/generate-sections')
  , disableStep           = require('./components/disable-processing-step')

  , revisionForm;

exports._parent = require('./business-process-revision-documents');
exports._match = 'document';

exports._dynamic = function () {
	var listItemId = 'document-item-' + camelToHyphen.call(this.document.uniqueKey);
	var conf = {};
	conf[listItemId] = { class: { active: true } };
	return conf;
};

revisionForm = function (requirementUpload) {
	var revFail, revFailOther, revFailInput;

	return form(
		{ id: 'form-revision-requirement-upload',
			action: '/revision-requirement-upload/' + requirementUpload.master.__id__ +
				'/' + camelToHyphen.call(requirementUpload.document.uniqueKey) + '/',
			method: 'post', class: 'submitted-preview-form' },
		ul(
			{ class: 'form-elements' },
			li(div({ class: 'input' }, input({ dbjs: requirementUpload._status }))),
			li(
				revFail = div({ class: 'input' },
					revFailInput = input({ dbjs: requirementUpload._rejectReasonTypes, type: 'checkbox' })
						._dbjsInput),
				revFailOther = div({ class: 'official-form-document-revision-reject-reason' },
					field({ dbjs: requirementUpload._rejectReasonMemo }))
			),
			li(input({ type: 'submit', value: _("Save") }))
		),
		legacy('radioMatch', 'form-revision-requirement-upload',
			requirementUpload.__id__ + '/status', { invalid: revFail.getId() }),
		legacy('checkboxToggle', normalize(revFailInput.itemsByValue.other.dom).getId(),
				revFailOther.getId())
	);
};

exports['revision-document'] = function () {
	var doc = this.document;
	var processingStep = this.processingStep;
	var reqUploads = this.processingStep.requirementUploads.applicable;
	var nextReqUpload = reactiveSibling.next(reqUploads, doc.owner);
	var nextReqUploadUrl = nextReqUpload.map(function (nextReqUpload) {
		if (!nextReqUpload) return null;
		return nextReqUpload.docUrl;
	});
	var prevReqUpload = reactiveSibling.previous(reqUploads, doc.owner);
	var prevReqUploadUrl = prevReqUpload.map(function (nextReqUpload) {
		if (!prevReqUpload) return null;
		return prevReqUpload.docUrl;
	});

	return [div({ id: 'revision-box', class: 'business-process-revision-box' },
		div({ class: 'business-process-revision-box-header' },
			div({ class: 'business-process-submitted-box-header-document-title' },
				doc._label),
			div({ class: 'business-process-revision-box-controls' },
				_if(prevReqUpload,
					a({ href: prevReqUploadUrl,
						class: 'hint-optional hint-optional-left',
						'data-hint': _('Previous document') },
						i({ class: 'fa fa-angle-left' }))),
				_if(nextReqUpload,
					a({ href: nextReqUploadUrl,
						class: 'hint-optional hint-optional-left', 'data-hint': _('Next document') },
						i({ class: 'fa fa-angle-right' })))
					)),
		insert(_if(processingStep.processableUploads.has(doc.owner),
			disableStep(this.processingStep, revisionForm(doc.owner))))),
		div({ id: 'user-document', class: 'business-process-submitted-selected-document' },
			div({ class: 'submitted-preview' },
				div({ id: 'document-preview', class: 'submitted-preview-document' },
					renderDocument(doc)),
				div({ class: 'submitted-preview-user-data  entity-data-section-side' },
					generateSections(this.businessProcess.dataForms.applicable, { viewContext: this })
					),
				div({ id: 'document-history', class: 'submitted-preview-document-history' },
					renderDocumentHistory(doc))
				))];
};
