// Document view

'use strict';

var includes              = require('es5-ext/array/#/contains')
  , normalizeOptions      = require('es5-ext/object/normalize-options')
  , syncStyle             = require('dom-ext/html-element/#/sync-style')
  , _                     = require('mano').i18n.bind('View: Component: Documents')
  , isReadOnlyRender      = require('mano/client/utils/is-read-only-render')
  , getArrayIndex         = require('../../utils/get-observable-array-index')
  , docMimeTypes          = require('../../utils/microsoft-word-doc-mime-types')
  , pathToUrl             = require('../../utils/upload-path-to-url')
  , reactiveSibling       = require('../utils/reactive-document-sibling')
  , syncHeight            = require('../utils/sync-height')
  , isMobileView          = require('../utils/is-mobile-view')
  , getCertificates       = require('../utils/get-certificates-list')
  , getUploads            = require('../utils/get-uploads-list')
  , getResolveDocumentUrl = require('../utils/get-resolve-document-url');

var getFilePreview = function (file) {
	var type = file.type;
	if (includes.call(docMimeTypes, type)) {
		return img({ class: 'submitted-preview-new-word-document', src: '/img/word-doc-icon.png' });
	}
	if (!isReadOnlyRender && (type === 'application/pdf')) {
		return iframe({
			src: url('pdfjs/web/viewer.html?file=') + encodeURIComponent('/' + file.path)
		});
	}
	return img({
		zoomOnHover: true,
		src: mmap(or(file.previewPath, file.thumbPath), function (path) {
			if (path) return stUrl(pathToUrl(path));
		})
	});
};

module.exports = function (context, documentData/*, options*/) {
	var options          = normalizeOptions(arguments[2])
	  , mainContent      = options.mainContent
	  , businessProcess  = context.businessProcess
	  , collectionTarget = options.uploadsResolver || businessProcess
	  , kind             = context.documentKind

	  , collection, nextDocumentUrl, previousDocumentUrl, docPreviewElement, sideContentContainer;

	if (kind === 'certificate') collection = getCertificates(collectionTarget, context.appName);
	else collection = getUploads(collectionTarget, context.appName);

	var resolveDocumentUrl = getResolveDocumentUrl(kind, collection, options);

	nextDocumentUrl = reactiveSibling.next(collection, context.documentUniqueKey)
		.map(resolveDocumentUrl);
	previousDocumentUrl = reactiveSibling.previous(collection, context.documentUniqueKey)
		.map(resolveDocumentUrl);

	var result = [
		div({ id: 'submitted-box', class: 'business-process-submitted-box' },
			div({ class: 'business-process-submitted-box-header' },

				// Label
				div({ class: 'business-process-submitted-box-header-document-title' }, documentData.label),

				// Links to previous and next document
				div({ class: 'business-process-submitted-box-controls' },
					div({ class: 'label-doc-type' }, _('Document')),
					_if(previousDocumentUrl,
						a({ href: previousDocumentUrl,
							class: 'hint-optional hint-optional-left',
							'data-hint': _('Previous document') },
							i({ class: 'fa fa-angle-left' }))),
					_if(nextDocumentUrl,
						a({ href: nextDocumentUrl,
							class: 'hint-optional hint-optional-left', 'data-hint': _('Next document') },
							i({ class: 'fa fa-angle-right' }))))),

			options.prependContent),

		// Document preview
		div({ class: 'business-process-submitted-selected-document' },
			div({ class: 'submitted-preview' },

				// Main content
				mainContent || _if(documentData.filesSize, function () {
					var moreThanOneFile = gt(documentData.filesSize, 1);

					return div({ id: 'document-preview', class: ['submitted-preview-document',
						'business-process-document-preview'] },

						div({ class: 'container-with-nav' },
							div({ class: 'business-process-document-preview-external-links' },

								// Open file in new window link
								span({ id: 'doc-open-links',
									class: 'business-process-document-preview-download-links' },
									list(documentData.files, function (file) {
										var linkAttributes = { target: '_blank', href: stUrl(pathToUrl(file.path)),
											class: _if(eq(file, getArrayIndex(documentData.files, 0)), 'active') };

										if (includes.call(docMimeTypes, file.type)) {
											linkAttributes.download = file.path;
										} else if (!isReadOnlyRender && (file.type === 'application/pdf')) {
											linkAttributes.href = '/pdfjs/web/viewer.html?file=' +
												encodeURIComponent('/' + file.path);
										}

										return a(linkAttributes, _("Open file in new window"));
									})),

								// Download document lint
								a({ href: _if(documentData.filesSize,
									_if(eq(documentData.filesSize, 1),
										mmap(resolve(getArrayIndex(documentData.files, 0), 'path'), function (path) {
											if (path) return stUrl(pathToUrl(path));
										}),
										'/' + documentData.archiveUrl)),
									download: _if(documentData.filesSize,
										_if(eq(documentData.filesSize, 1),
											resolve(documentData.firstFile, 'path'),
											documentData.archiveUrl)) }, _("Download document"))),

							// Document files navigation (top)
							_if(moreThanOneFile, div(
								{ class: 'business-process-document-preview-navigation' },
								div({ id: 'submitted-preview-new-navigation-top' },
									a({ class: 'previous' }, span({ class: 'fa fa-chevron-circle-left' },
										_("Previous"))),
									span(span({ class: 'current-index' }, "1"), " / ", documentData.filesSize),
									a({ class: 'next' }, span({ class: 'fa fa-chevron-circle-right' }, _("Next"))))
							))),

						// Document file preview (usually zoomable)
						docPreviewElement = ul({
							id: 'doc-previews',
							class: 'submitted-preview-new-image-placeholder'
						}, documentData.files, function (file) {
							return li({ class: _if(eq(file, getArrayIndex(documentData.files, 0)), 'active') },
								getFilePreview(file));
						}),

						// Document files navigation (bottom)
						_if(moreThanOneFile, div(
							{ class: 'submitted-preview-new-documents-navigation' },
							div({ id: 'submitted-preview-new-navigation-bottom' },
								a({ class: 'previous' }, span({ class: 'fa fa-chevron-circle-left' },
									_("Previous"))),
								span(span({ class: 'current-index' }, "1"), " / ", documentData.filesSize),
								a({ class: 'next' }, span({ class: 'fa fa-chevron-circle-right' }, _("Next"))))
						)),

						// Legacy scripts
						_if(moreThanOneFile, [
							legacy('hashNavOrderedListControls', 'submitted-preview-new-navigation-top',
								'doc-previews', 'doc-preview'),
							legacy('hashNavOrderedListControls', 'submitted-preview-new-navigation-bottom',
								'doc-previews', 'doc-preview'),
							legacy('hashNavDocumentLink', 'doc-open-links', 'doc-preview'),
							legacy('hashNavOrderedList', 'doc-previews', 'doc-preview')
						]));
				},

					// When no files in document
					div({ class: 'submitted-preview-document-missing' },
						p(_("This document does not have any physical file attached to it.")))),

				// Side content
				sideContentContainer = div(
					{ class: 'submitted-preview-user-data  entity-data-section-side' },
					options.sideContent
				)))
	];

	if (docPreviewElement) {
		// 'syncHeight' ensures that document file preview is enforced to be displayed with
		// A4 proportions, and with respect to VR (its height is in all cases multiplication of 22px)
		syncHeight(docPreviewElement);
		// `syncStyle` ensures that side content has exactly same height as main content
		syncStyle.call(sideContentContainer, docPreviewElement, 'height', isMobileView);
	}

	return result;
};
