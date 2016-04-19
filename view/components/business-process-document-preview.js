// Documents viewer

'use strict';

var _                  = require('mano').i18n.bind('Document: preview')
  , resolveArchivePath = require('../../utils/resolve-document-archive-path')
  , syncHeight         = require('../utils/sync-height')
  , getFilePreview     = require('../utils/get-file-preview');

module.exports = function (doc) {
	var elem;
	return [
		div({ class: 'business-process-document-preview' },
			div({ class: 'container-with-nav' },
				div({ class: 'business-process-document-preview-external-links' },
					a({ target: '_blank', href: _if(doc.files.ordered._size,
						_if(eq(doc.files.ordered._size, 1),
							resolve(doc.files.ordered._first, 'url'),  '/' + resolveArchivePath(doc)
							))
						}, "Open document in new tab"),
					a({ href: _if(doc.files.ordered._size,
						_if(eq(doc.files.ordered._size, 1),
							resolve(doc.files.ordered._first, 'url'),  '/' + resolveArchivePath(doc)
							)),
						download: _if(doc.files.ordered._size, _if(eq(doc.files.ordered._size, 1),
							resolve(doc.files.ordered._first, 'path'),  resolveArchivePath(doc)
							))
						}, "Download document")),

				_if(gt(doc.files.ordered._size, 1),
					div({ class: 'business-process-document-preview-navigation' },
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

			elem = ul({ id: 'doc-previews',
				class: 'business-process-document-preview-image-placeholder' },
				doc.files.ordered, function (file) {
					li({ class: _if(eq(file, doc.files.ordered._first), 'active') },
						getFilePreview(file));
				}, doc),

			insert(_if(gt(doc.files.ordered._size, 1),
				div({ class: 'business-process-document-preview-navigation' },
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

			syncHeight(elem))
	];
};
