// Document view

'use strict';

var _                     = require('mano').i18n.bind('User Submitted')
  , renderDocumentPreview = require('./business-process-document-preview')
  , documentRevsionInfo   = require('./business-process-document-review-info')
  , reactiveSibling       = require('../../utils/reactive-sibling')
  , _d                    = _;

module.exports = function (doc, collection, sideContent) {
	var isCertificate = doc.owner.owner.key === 'certificates'
	  , nextDocument, previousDocument, nextDocumentUrl, previousDocumentUrl;

	var resolveDocumentUrl = function (elem) {
		if (!elem) return null;
		return isCertificate ? elem.docUrl : elem.document.docUrl;
	};

	if (isCertificate) {
		// Certificate case
		nextDocument = reactiveSibling.next(collection, doc);
		previousDocument = reactiveSibling.previous(collection, doc);
	} else {
		// Requirement upload or payment receipt case
		nextDocument = reactiveSibling.next(collection, doc.owner);
		previousDocument = reactiveSibling.previous(collection, doc.owner);
	}

	nextDocumentUrl = nextDocument.map(resolveDocumentUrl);
	previousDocumentUrl = previousDocument.map(resolveDocumentUrl);

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
		isCertificate ? null : insert(documentRevsionInfo(doc)),
		div({ id: 'user-document', class: 'business-process-submitted-selected-document' },
			renderDocumentPreview(doc, sideContent))];
};
