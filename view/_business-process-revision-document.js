// Documents viewer

'use strict';

var _                  = require('mano').i18n.bind('Revision: Document')
  , resolveArchivePath = require('../utils/resolve-document-archive-path')
  , syncHeight         = require('./utils/sync-height');

module.exports = function (doc, sideContent) {
	var elem;
	return [
		div({ class: 'submitted-preview-revision-document' },
			div({ class: 'container-with-nav' },
				_if(gt(doc.files.ordered._size, 1),
					div({ class: 'submitted-preview-new-documents-navigation' },
						div(
							{ id: 'submitted-preview-new-navigation-top' },
							a({ class: 'previous' }, span({ class: 'fa fa-chevron-circle-left' },
									_("Previous"))),
							span(span({ class: 'current-index' }, "1"), " / ",
								doc.files.ordered._size),
							a({ class: 'next' }, span({ class: 'fa fa-chevron-circle-right' }, _("Next")))
						))
					)
				),

			elem = ul({ id: 'doc-previews', class: 'submitted-preview-new-image-placeholder' },
				doc.files.ordered, function (file) {
					li({ class: _if(eq(file, doc.files.ordered._first), 'active') },
						img({ zoomOnHover: true, src: or(resolve(file._preview, '_url'),
							resolve(file._thumb, '_url')) }));
				}, doc),

			insert(_if(gt(doc.files.ordered._size, 1),
				div({ class: 'submitted-preview-new-documents-navigation' },
					div(
						{ id: 'submitted-preview-new-navigation-bottom' },
						a({ class: 'previous' }, span({ class: 'fa fa-chevron-circle-left' }, _("Previous"))),
						span(span({ class: 'current-index' }, "1"), " / ",
							doc.files.ordered._size),
						a({ class: 'next' }, span({ class: 'fa fa-chevron-circle-right' }, _("Next"))),
						legacy('hashNavOrderedListControls',
							'submitted-preview-new-navigation-top', 'doc-previews',
								'doc-preview'),
						legacy('hashNavOrderedListControls',
								'submitted-preview-new-navigation-bottom', 'doc-previews',
								'doc-preview'),
						legacy('hashNavOrderedList', 'doc-previews', 'doc-preview')
					)))),

			syncHeight(elem)),

		div(a({ class: 'button-main', href: _if(doc.files.ordered._size,
				_if(eq(doc.files.ordered._size, 1),
					resolve(doc.files.ordered._first, 'url'),  '/' + resolveArchivePath(doc)
				)),
				download: _if(doc.files.ordered._size, _if(eq(doc.files.ordered._size, 1),
					resolve(doc.files.ordered._first, 'path'),  resolveArchivePath(doc)
				))
			}, "Download document"),
			sideContent)
	];
};
