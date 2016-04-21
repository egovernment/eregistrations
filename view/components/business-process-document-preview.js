// Documents viewer

'use strict';

var _                  = require('mano').i18n.bind('Document: preview')
  , resolveArchivePath = require('../../utils/resolve-document-archive-path')
  , syncHeight         = require('../utils/sync-height')
  , getFilePreview     = require('../utils/get-file-preview')
  , includes           = require('es5-ext/array/#/contains')
  , docMimeTypes       = require('../../utils/microsoft-word-doc-mime-types')
  , isReadOnlyRender   = require('mano/client/utils/is-read-only-render');

module.exports = function (doc, sideContent) {
	var files           = doc.files.ordered
	  , moreThanOneFile = gt(files._size, 1)
	  , docPreviewElement;

	return div(
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
						  , linkText       = _("Open document in new window")
						  , linkAttributes = {
							target: '_blank',
							href: file._url,
							class: _if(eq(file, files._first), 'active')
						};

						if (includes.call(docMimeTypes, type)) {
							linkAttributes.download = file._name;
						} else if (!isReadOnlyRender && (type === 'application/pdf')) {
							linkAttributes.href = file._path.map(function (path) {
								if (path) return url('pdfjs/web/viewer.html?file=') + path;
							});
						}

						return a(linkAttributes, linkText);
					})),
					a({ target: '_blank', href: '/' + resolveArchivePath(doc),
						download: resolveArchivePath(doc) }, _("Download documents"))
				),
				// File navigation
				_if(moreThanOneFile, div(
					{ class: 'business-process-document-preview-navigation' },
					div({ id: 'submitted-preview-new-navigation-top' },
						a({ class: 'previous' }, span({ class: 'fa fa-chevron-circle-left' }, _("Previous"))),
						span(span({ class: 'current-index' }, "1"), " / ", files._size),
						a({ class: 'next' }, span({ class: 'fa fa-chevron-circle-right' }, _("Next"))))
				))
			),
			// File render
			docPreviewElement = ul({
				id: 'doc-previews',
				class: 'submitted-preview-new-image-placeholder'
			}, files, function (file) {
				li({ class: _if(eq(file, files._first), 'active') }, getFilePreview(file));
			}, doc),
			// File navigation - bottom
			_if(moreThanOneFile, div(
				{ class: 'submitted-preview-new-documents-navigation' },
				div({ id: 'submitted-preview-new-navigation-bottom' },
					a({ class: 'previous' }, span({ class: 'fa fa-chevron-circle-left' }, _("Previous"))),
					span(span({ class: 'current-index' }, "1"), " / ", files._size),
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
			]),
			syncHeight(docPreviewElement)
		), div(
			{ class: 'submitted-preview-document-missing' },
			p(_("This document does not have any physical file attached to it."))
		)),
		div(
			{ class: 'submitted-preview-user-data  entity-data-section-side' },
			sideContent
		)
	);
};
