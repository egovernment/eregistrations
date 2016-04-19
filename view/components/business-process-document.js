// Document view

'use strict';

var _                   = require('mano').i18n.bind('User Submitted')
  , renderDocument      = require('./business-process-document-preview')
  , reactiveSibling     = require('../../utils/reactive-sibling')
  , documentRevsionInfo = require('../_business-process-document-review-info')
  , _d                  = _;

module.exports = function (doc, collection, sideContent) {
	var nextDocument, previousDocument, nextDocumentUrl, previousDocumentUrl;
	if (doc.owner.owner.key === 'certificates') {
		// Certificate case
		nextDocument = reactiveSibling.next(collection, doc);
		previousDocument = reactiveSibling.previous(collection, doc);
	} else {
		// Requirement upload or payment receipt case
		nextDocument = reactiveSibling.next(collection, doc.owner);
		previousDocument = reactiveSibling.previous(collection, doc.owner);
	}

	nextDocumentUrl = nextDocument.map(function (nextDocument) {
		if (!nextDocument) return null;
		return nextDocument.docUrl;
	});

	previousDocumentUrl = previousDocument.map(function (previousDocument) {
		if (!previousDocument) return null;
		return previousDocument.docUrl;
	});

	return [div({ id: 'submitted-box', class: 'business-process-submitted-box' },
		div({ class: 'business-process-submitted-box-header' },
			div({ class: 'business-process-submitted-box-header-document-title' },
				_d(doc.label, doc.getTranslations())),
			div({ class: 'business-process-submitted-box-controls' },
				div({ class: 'label-doc-type' }, _('Document')),
				_if(previousDocument,
					a({ href: previousDocumentUrl,
						class: 'hint-optional hint-optional-left',
						'data-hint': _('Previous document') },
						i({ class: 'fa fa-angle-left' }))),
				_if(nextDocument,
					a({ href: nextDocumentUrl,
						class: 'hint-optional hint-optional-left', 'data-hint': _('Next document') },
						i({ class: 'fa fa-angle-right' })))
					))),
		doc.isCertificate ? null : insert(documentRevsionInfo(doc)),
		div({ id: 'user-document', class: 'business-process-submitted-selected-document' },
			div({ class: 'submitted-preview' },
				div({ id: 'document-preview', class: 'submitted-preview-document' },
					renderDocument(doc)),
				div({ class: 'submitted-preview-user-data  entity-data-section-side' },
					sideContent)))];
};
