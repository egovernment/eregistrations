// Payment viewer

'use strict';

var syncHeight = require('./utils/sync-height')
  , _          = require('mano').i18n.bind('User: Submitted')
  , scrollBottom     = require('./utils/scroll-to-bottom')
  , nextTick = require('next-tick')
  , curry = require('es5-ext/function/#/curry')
  , _d = _
  , db = require('mano').db;

module.exports = function (payment, sideContent) {
	var elem, scrollableElem, master;
	if (payment.issuedBy.constructor === db.Institution) {
		master = payment.master;
	} else {
		master = payment.owner.owner.owner.owner;
	}
	return [h2(_d(payment.label, { entity: master })),
		section(
			{ class: 'section-primary' },
			h2(_("Payment history")),
			scrollableElem = div(
				{ class: 'submitted-user-history-wrapper' },
				table(
					{ class: 'submitted-user-history' },
					tbody(
						payment.statusLog.ordered,
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
					h3(span({ class: 'submitted-preview-new-item-number' })),

					_if(gt(payment.files.ordered._size, 1),
						div({ class: 'submitted-preview-new-documents-navigation' },
							div(
								{ id: 'submitted-preview-new-navigation-top' },
								a({ class: 'previous' }, span({ class: 'fa fa-chevron-circle-left' },
										_("Previous"))),
								span(span({ class: 'current-index' }, "1"), " / ",
									payment.files.ordered._size),
								a({ class: 'next' }, span({ class: 'fa fa-chevron-circle-right' }, _("Next")))
							))
						)
					),

				elem = ul({ id: 'doc-previews', class: 'submitted-preview-new-image-placeholder' },
					payment.files.ordered, function (file) {
						li({ class: _if(eq(file, payment.files.ordered._first), 'active') },
							img({ zoomOnHover: true, src: or(resolve(file._preview, '_url'),
								resolve(file._thumb, '_url')) }));
					}, payment),

				insert(_if(gt(payment.files.ordered._size, 1),
					div({ class: 'submitted-preview-new-documents-navigation' },
						div(
							{ id: 'submitted-preview-new-navigation-bottom' },
							a({ class: 'previous' }, span({ class: 'fa fa-chevron-circle-left' }, _("Previous"))),
							span(span({ class: 'current-index' }, "1"), " / ",
								payment.files.ordered._size),
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
