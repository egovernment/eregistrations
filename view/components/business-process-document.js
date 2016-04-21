// Document view

'use strict';

var _                     = require('mano').i18n.bind('User Submitted')
  , normalizeOptions      = require('es5-ext/object/normalize-options')
  , renderDocumentPreview = require('./business-process-document-preview')
  , reactiveSibling       = require('../../utils/reactive-sibling')
  , _d                    = _;

module.exports = function (doc, collection/*, options*/) {
	var options       = normalizeOptions(arguments[2])
	  , isCertificate = doc.owner.owner.key === 'certificates'
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

	return [
		div(
			{ id: 'submitted-box', class: 'business-process-submitted-box' },
			div(
				{ class: 'business-process-submitted-box-header' },
				div(
					{ class: 'business-process-submitted-box-header-document-title' },
					_d(doc.label, doc.getTranslations())
				),
				div(
					{ class: 'business-process-submitted-box-controls' },
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
				)
			),
			insert(options.prependContent)
		),
		div({ id: 'user-document', class: 'business-process-submitted-selected-document' },
			renderDocumentPreview(doc, options.sideContent)),
		insert(options.appendContent)];
};
