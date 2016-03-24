// Single document revision view

'use strict';

var _              = require('mano').i18n.bind('Official: Revision')
  , camelToHyphen  = require('es5-ext/string/#/camel-to-hyphen')
  , renderDocument = require('./_business-process-revision-document')
  , renderDocumentHistory = require('./_business-process-revision-document-history')

  , revisionForm;

exports._parent = require('./business-process-revision-documents');
exports._match = 'document';

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

exports['document-preview'] = function () {
	renderDocument(this.document);
};

exports['document-history'] = function () {
	renderDocumentHistory(this.document);
};

exports['revision-box'] = function () {
	var prevDoc, nextDoc, nextInSet
	  , currentDoc = this.document
	  , bp = this.document.master;

	var urlPrefix = '/' + bp.__id__;

	if (bp.requirementUploads.applicable.size > 1) {
		var it = bp.requirementUploads.applicable.values();
		var result = it.next();

		while (!result.done && !nextDoc) {
			nextInSet = it.next();
			if (result.value.document === currentDoc) {
				nextDoc = nextInSet.done ? undefined : nextInSet.value.document;
			}
			if (!nextInSet.done && nextInSet.value.document === currentDoc) {
				prevDoc = result.value.document;
			}
			result = nextInSet;
		}
	}

	div({ class: 'business-process-revision-box-header' },
		ol({ class: 'submitted-documents-list' },
				li(this.document._label)),
		div({ class: 'business-process-revision-box-controls' },
			_if(prevDoc,
				a({ href: urlPrefix + resolve(prevDoc, 'docUrl'),
					class: 'hint-optional hint-optional-left',
					'data-hint': _('Previous document') },
					i({ class: 'fa fa-angle-left' }))),
			_if(nextDoc,
				a({ href: urlPrefix + resolve(nextDoc, 'docUrl'),
					class: 'hint-optional hint-optional-left', 'data-hint': _('Next document') },
					i({ class: 'fa fa-angle-right' })))
				));
		revisionForm(this.document.owner);
		
};
