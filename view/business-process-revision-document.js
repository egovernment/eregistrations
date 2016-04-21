// Single document revision view

'use strict';

var _                     = require('mano').i18n.bind('Official: Revision')
  , camelToHyphen         = require('es5-ext/string/#/camel-to-hyphen')
  , documentView          = require('./components/business-process-document')
  , renderDocumentHistory = require('./components/business-process-document-history')
  , generateSections      = require('./components/generate-sections')
  , disableStep           = require('./components/disable-processing-step')

  , revisionForm;

exports._parent  = require('./business-process-revision-documents');
exports._dynamic = require('./utils/document-dynamic-matcher')('document');
exports._match   = 'document';

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
	var doc            = this.document
	  , processingStep = this.processingStep;

	documentView(doc, this.processingStep.requirementUploads.applicable, {
		prependContent: insert(_if(processingStep.processableUploads.has(doc.owner),
			disableStep(this.processingStep, revisionForm(doc.owner)))),
		sideContent: generateSections(this.businessProcess.dataForms.applicable, { viewContext: this }),
		appendContent: renderDocumentHistory(doc)
	});
};
