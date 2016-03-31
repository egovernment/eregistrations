// Single certificate revision view

'use strict';

var _              = require('mano').i18n.bind('Official: Revision')
  , reactiveSibling = require('../utils/reactive-sibling')
  , renderDocument = require('./_business-process-revision-document')
  , renderDocumentHistory = require('./_business-process-revision-document-history')
  , generateSections = require('./components/generate-sections')
  , endsWith           = require('es5-ext/string/#/ends-with')
  , db                 = require('mano').db;

exports._parent = require('./business-process-revision-documents');
exports._match = 'document';

exports['revision-document'] = function () {
	var doc = this.document;
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
					))),
		div({ class: 'submitted-preview' },
			div({ id: 'document-preview', class: 'submitted-preview-document' },
				renderDocument(doc)),
			div({ class: 'submitted-preview-user-data  entity-data-section-side' },
				doc.dataForm.constructor !== db.FormSectionBase ?
						doc.dataForm.toDOM(document, {
							customFilter: function (resolved) {
								return !endsWith.call(resolved.observable.dbId, 'files/map');
							},
							disableHeader: false
						}) : null,
				doc.overviewSection.toDOM(document, { disableHeader: false }),
				generateSections(this.businessProcess.dataForms.applicable, { viewContext: this })
				),
			div({ id: 'document-history', class: 'submitted-preview-document-history' },
				renderDocumentHistory(doc))
			)];
};
