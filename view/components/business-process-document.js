// Document view

'use strict';

var _                     = require('mano').i18n.bind('User Submitted')
  , isReadOnlyRender      = require('mano/client/utils/is-read-only-render')
  , normalizeOptions      = require('es5-ext/object/normalize-options')
  , includes              = require('es5-ext/array/#/contains')
  , syncStyle             = require('dom-ext/html-element/#/sync-style')
  , reactiveSibling       = require('../../utils/reactive-sibling')
  , docMimeTypes          = require('../../utils/microsoft-word-doc-mime-types')
  , resolveArchivePath    = require('../../utils/resolve-document-archive-path')
  , syncHeight            = require('../utils/sync-height')
  , getFilePreview        = require('../utils/get-file-preview')
  , isMobileView          = require('../utils/is-mobile-view')
  , _d                    = _;

module.exports = function (doc, collection/*, options*/) {
	var options         = normalizeOptions(arguments[2])
	  , isCertificate   = doc.owner.owner.key === 'certificates'
	  , files           = doc.files.ordered
	  , moreThanOneFile = gt(files._size, 1)
	  , nextDocument, previousDocument, nextDocumentUrl, previousDocumentUrl, docPreviewElement
	  , sideContentContainer;

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
			options.prependContent
		),
		div(
			{ class: 'business-process-submitted-selected-document' },
			div(
				{ class: 'submitted-preview' },
				_if(files._size, div(
					{ id: 'document-preview', class: ['submitted-preview-document',
						'business-process-document-preview'] },
					// Top links container
					div(
						{ class: 'container-with-nav' },
						// Download links
						div(
							{ class: 'business-process-document-preview-external-links' },
							span({
								id: 'doc-open-links',
								class: 'business-process-document-preview-download-links'
							}, list(files, function (file) {
								var type           = file.type
								  , linkText       = _("Open file in new window")
								  , linkAttributes = {
									target: '_blank',
									href: file._url,
									class: _if(eq(file, files._first), 'active')
								};

								if (includes.call(docMimeTypes, type)) {
									linkAttributes.download = file._name;
								} else if (!isReadOnlyRender && (type === 'application/pdf')) {
									linkAttributes.href = file._path.map(function (path) {
										if (path) {
											return '/pdfjs/web/viewer.html?file=/'
												+ encodeURIComponent(path);
										}
									});
								}

								return a(linkAttributes, linkText);
							})),
							a({ target: '_blank', href: '/' + resolveArchivePath(doc),
								download: resolveArchivePath(doc) }, _("Download document"))
						),
						// File navigation
						_if(moreThanOneFile, div(
							{ class: 'business-process-document-preview-navigation' },
							div({ id: 'submitted-preview-new-navigation-top' },
								a({ class: 'previous' }, span({ class: 'fa fa-chevron-circle-left' },
									_("Previous"))),
								span(span({ class: 'current-index' }, "1"), " / ", files._size),
								a({ class: 'next' }, span({ class: 'fa fa-chevron-circle-right' },
									_("Next"))))
						))
					),
					// File render
					docPreviewElement = ul({
						id: 'doc-previews',
						class: 'submitted-preview-new-image-placeholder'
					}, files, function (file) {
						return li({ class: _if(eq(file, files._first), 'active') }, getFilePreview(file));
					}, doc),
					// File navigation - bottom
					_if(moreThanOneFile, div(
						{ class: 'submitted-preview-new-documents-navigation' },
						div({ id: 'submitted-preview-new-navigation-bottom' },
							a({ class: 'previous' }, span({ class: 'fa fa-chevron-circle-left' },
								_("Previous"))),
							span(span({ class: 'current-index' }, "1"), " / ", files._size),
							a({ class: 'next' }, span({ class: 'fa fa-chevron-circle-right' },
								_("Next"))))
					)),
					// Legacy scripts
					_if(moreThanOneFile, [
						legacy('hashNavOrderedListControls', 'submitted-preview-new-navigation-top',
							'doc-previews', 'doc-preview'),
						legacy('hashNavOrderedListControls', 'submitted-preview-new-navigation-bottom',
							'doc-previews', 'doc-preview'),
						legacy('hashNavDocumentLink', 'doc-open-links', 'doc-preview'),
						legacy('hashNavOrderedList', 'doc-previews', 'doc-preview')
					]),
					syncHeight(docPreviewElement)
				), div(
					{ class: 'submitted-preview-document-missing' },
					p(_("This document does not have any physical file attached to it."))
				)),
				sideContentContainer = div(
					{ class: 'submitted-preview-user-data  entity-data-section-side' },
					options.sideContent
				),
				// This hack is here because unfortunately this function returns object that gets
				// stringified by domjs into DOM.
				syncStyle.call(sideContentContainer, docPreviewElement, 'height', isMobileView) && null
			)
		)];
};
