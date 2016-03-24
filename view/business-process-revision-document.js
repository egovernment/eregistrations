// Single document revision view

'use strict';

var _              = require('mano').i18n.bind('Official: Revision')
  , camelToHyphen  = require('es5-ext/string/#/camel-to-hyphen')
  , getPrevNext = require('../utils/get-prev-next-set')
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
	var currentDoc = this.document.owner
	  , bp = this.document.master
	  , prevNextPair, prevDoc, nextDoc
	  , docSet;

	var urlPrefix = '/' + bp.__id__;

	docSet = bp.requirementUploads.applicable.or(bp.certificates.applicable);

	prevNextPair = getPrevNext(docSet, currentDoc);
	// because diff type of objects in the set
	prevDoc = prevNextPair.prev || undefined;
	prevDoc = (prevDoc && prevDoc.document) ? prevDoc.document : prevDoc;
	// because diff type of objects in the set
	nextDoc = prevNextPair.next || undefined;
	nextDoc = (nextDoc && nextDoc.document) ? nextDoc.document : nextDoc;

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
	revisionForm(currentDoc);
};
