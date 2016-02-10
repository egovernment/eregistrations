// Documents viewer

'use strict';

var curry              = require('es5-ext/function/#/curry')
  , nextTick           = require('next-tick')
  , _                  = require('mano').i18n.bind('User: Submitted')
  , resolveArchivePath = require('../utils/resolve-document-archive-path')
  , syncHeight         = require('./utils/sync-height')
  , scrollBottom       = require('./utils/scroll-to-bottom')
  , isReadOnlyRender   = require('mano/client/utils/is-read-only-render')
  , docMimeTypes       = require('../utils/microsoft-doc-mime-types')

  , _d = _;

module.exports = function (doc, sideContent) {
	var elem, scrollableElem, master;
	if (doc.isCertificate) {
		master = doc.master;
	} else {
		master = doc.owner.owner.owner.owner;
	}

	return [h2(doc._label.map(function (label) { return _d(label, { user: master }); })),
		section(
			{ class: 'section-primary' },
			h2(_("Documents history")),
			scrollableElem = div(
				{ class: 'submitted-user-history-wrapper' },
				table(
					{ class: 'submitted-user-history' },
					tbody(
						doc.statusLog.ordered,
						function (log) {
							th(log.label);
							td({ class: 'submitted-user-history-time' }, log.time);
							td(log.text && log.text.split('\n').filter(Boolean).map(curry.call(p, 1)));
						}
					)
				)
			)
		),
		nextTick(function () { scrollBottom(scrollableElem); }),
		section({ class: 'submitted-preview-new' },
			div({ class: 'section-primary submitted-preview-new-document' },
				div({ class: 'container-with-nav' },
					h3(span({ class: 'submitted-preview-new-item-number' })),

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
							_if(file._type.map(function (type) {
								return docMimeTypes.indexOf(type) !== -1;
							}), img({ width: '150px', src: '/img/word-doc-icon.png' }),
								_if(and(not(isReadOnlyRender), eq(file._type, 'application/pdf')),
									function () {
										return iframe({
											width: '100%',
											height: '100%',
											src: url('pdfjs/web/viewer.html?file=') + file.path
										});
									}, function () {
										return img({ zoomOnHover: true, src: or(resolve(file._preview, '_url'),
											resolve(file._thumb, '_url')) });
									})));
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

				div({ class: 'section-primary submitted-preview-new-side-data' },
					a({ class: 'button-main', href: _if(doc.files.ordered._size,
						_if(eq(doc.files.ordered._size, 1),
							resolve(doc.files.ordered._first, 'url'),  '/' + resolveArchivePath(doc)
						)),
						download: _if(doc.files.ordered._size, _if(eq(doc.files.ordered._size, 1),
							resolve(doc.files.ordered._first, 'path'),  resolveArchivePath(doc)
						))
					}, "Download document"),
					sideContent)
			)];
};
