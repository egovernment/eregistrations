// Single certificate submitted view

'use strict';

var renderDocument = require('./_business-process-submitted-document')
  , renderDocumentHistory = require('./_business-process-revision-document-history')
  , reactiveSibling = require('../utils/reactive-sibling')
  , endsWith           = require('es5-ext/string/#/ends-with')
  , db                 = require('mano').db
  , _                = require('mano').i18n.bind('User Submitted');

exports._parent = require('./business-process-submitted-documents');
exports._match = 'document';

exports['selection-preview'] = function () {
	var reqUploads = this.processingStep.requirementUploads.applicable;
	var nextReqUpload = reactiveSibling.next(reqUploads, this.document);
	var nextReqUploadUrl = nextReqUpload.map(function (nextReqUpload) {
		if (!nextReqUpload) return null;
		return nextReqUpload.docUrl;
	});
	var prevReqUpload = reactiveSibling.previous(reqUploads, this.document);
	var prevReqUploadUrl = prevReqUpload.map(function (nextReqUpload) {
		if (!prevReqUpload) return null;
		return prevReqUpload.docUrl;
	});

	return [div({ id: 'submitted-box', class: 'business-process-submitted-box' },
		div({ class: 'business-process-submitted-box-header' },
			div({ class: 'business-process-submitted-box-header-document-title' },
				this.document._label),
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
					))),
		div({ id: 'user-document', class: 'business-process-submitted-selected-document' },
			div({ class: 'submitted-preview' },
				div({ id: 'document-preview', class: 'submitted-preview-document' },
					renderDocument(this.document)),
				div({ id: 'document-history', class: 'submitted-preview-document-history' },
					section(
						{ class: 'section-primary' },
						this.document.dataForm.constructor !== db.FormSectionBase ?
								this.document.dataForm.toDOM(document, {
									customFilter: function (resolved) {
										return !endsWith.call(resolved.observable.dbId, 'files/map');
									},
									disableHeader: true
								}) : null,
						this.document.overviewSection.toDOM(document, { disableHeader: true })
					),
					renderDocumentHistory(this.document))))];
};
