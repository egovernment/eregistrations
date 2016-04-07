// Payment receipt view

'use strict';

var renderDocument = require('../_business-process-document-preview')
  , renderDocumentHistory = require('../_business-process-revision-document-history')
  , reactiveSibling = require('../../utils/reactive-sibling')
  , _                = require('mano').i18n.bind('User Submitted');

module.exports = function (context) {
	var reqUploads = context.businessProcess.requirementUploads.applicable;
	var nextReqUpload = reactiveSibling.next(reqUploads, context.document.owner);
	var nextReqUploadUrl = nextReqUpload.map(function (nextReqUpload) {
		if (!nextReqUpload) return null;
		return nextReqUpload.docUrl;
	});
	var prevReqUpload = reactiveSibling.previous(reqUploads, context.document.owner);
	var prevReqUploadUrl = prevReqUpload.map(function (nextReqUpload) {
		if (!prevReqUpload) return null;
		return prevReqUpload.docUrl;
	});

	return [div({ id: 'submitted-box', class: 'business-process-submitted-box' },
		div({ class: 'business-process-submitted-box-header' },
			div({ class: 'business-process-submitted-box-header-document-title' },
				context.document._label),
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
					renderDocument(context.document)),
				div({ class: 'submitted-preview-user-data  entity-data-section-side' },
					renderDocumentHistory(context.document))))];
};
