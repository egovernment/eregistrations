// Documents viewer

'use strict';

var syncHeight = require('./utils/sync-height')
  , _          = require('mano').i18n.bind('User: Submitted')
  , scrollBottom     = require('./utils/scroll-to-bottom')
  , nextTick = require('next-tick')
  , curry = require('es5-ext/function/#/curry')
  , _d = _;

module.exports = function (doc, sideContent) {
	var elem, scrollableElem;

	return [h2(_d(doc.label)),
		section(
			{ class: 'section-primary' },
			h2(_("Documents history")),
			scrollableElem = div(
				{ class: 'submitted-user-history-wrapper' },
				table(
					{ class: 'submitted-user-history' },
					console.log(doc.files.ordered.size),
					tbody(
						doc.statusLog.ordered,
						function (log) {
							th(log.label);
							td(log.time);
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
					h3(span({ class: 'submitted-preview-new-item-number' }),
						_d(doc.label, { user: doc.master })),

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
				div({ class: 'section-primary submitted-preview-new-side-data' },
					a({ class: 'button-main' }, "Download document"),
					sideContent)
			)];
};
