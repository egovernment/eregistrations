// Documents viewer

'use strict';

var syncHeight = require('./utils/sync-height')
  , _          = require('mano').i18n.bind('User: Submitted')

  , _d = _;

module.exports = function (doc) {
	var elem;

	return [div({ class: 'container-with-nav' },
		h3(span({ class: 'submitted-preview-item-number' }),
			_d(doc.label, { user: doc.master })),

		_if(gt(doc.files.ordered._size, 1),
			div({ class: 'submitted-preview-documents-navigation' },
				div(
					{ id: 'submitted-preview-navigation-top' },
					a({ class: 'previous' }, span({ class: 'fa fa-chevron-circle-left' }, _("Previous"))),
					span(span({ class: 'current-index' }, "1"), " / ",
						doc.files.ordered._size),
					a({ class: 'next' }, span({ class: 'fa fa-chevron-circle-right' }, _("Next")))
				))
			)
		),

	elem = ul({ id: 'doc-previews', class: 'submitted-preview-image-placeholder' },
		doc.files.ordered, function (file) {
			li({ class: _if(eq(file, doc.files.ordered._first), 'active') },
				img({ zoomOnHover: true, src: or(resolve(file._preview, '_url'),
					resolve(file._thumb, '_url')) }));
		}, doc),

	insert(_if(gt(doc.files.ordered._size, 1),
		div({ class: 'submitted-preview-documents-navigation' },
			div(
				{ id: 'submitted-preview-navigation-bottom' },
				a({ class: 'previous' }, span({ class: 'fa fa-chevron-circle-left' }, _("Previous"))),
				span(span({ class: 'current-index' }, "1"), " / ",
					doc.files.ordered._size),
				a({ class: 'next' }, span({ class: 'fa fa-chevron-circle-right' }, _("Next"))),
				legacy('hashNavOrderedListControls', 'submitted-preview-navigation-top', 'doc-previews',
						'doc-preview'),
				legacy('hashNavOrderedListControls', 'submitted-preview-navigation-bottom', 'doc-previews',
						'doc-preview'),
				legacy('hashNavOrderedList', 'doc-previews', 'doc-preview')
			)))),

	syncHeight(elem)];
};
