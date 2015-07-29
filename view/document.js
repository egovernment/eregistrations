'use strict';

var scrollBottom     = require('./utils/scroll-to-bottom')
  , nextTick = require('next-tick')
  , _  = require('mano').i18n.bind('User Submitted');

exports._parent = require('./user-base');

exports['submitted-menu'] = function () {
	li(a({ class: 'submitted-menu-item-active' }, "Request"));
};

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		var scrollableElem;

		section(
			{ class: 'section-primary' },
			h2({ class: 'container-with-nav' }, _("Documents history"),
				a(
					{ class: 'hint-optional hint-optional-left',
						'data-hint': 'Print history of Your request',
						href: '/user-submitted/history-print/',
						target: '_blank' },
					span({ class: 'fa fa-print' }, "Print")
				)),
			scrollableElem = div(
				{ class: 'submitted-user-history-wrapper' },
				table(
					{ class: 'submitted-user-history' },
					tbody(
						tr(
							th(div("User")),
							td(div("24/07/2014 10:09:22")),
							td(div("Required modifications sent by user"))
						),
						tr(
							th(div("File sent")),
							td(div("24/07/2014 13:09:22")),
							td(div("File sent"))
						),
						tr(
							th(div("Official")),
							td(div("24/07/2014 16:19:22")),
							td(div("Document accepted"))
						),
						tr(
							th(div("User")),
							td(div("24/07/2014 10:09:22")),
							td(div("Required modifications sent by user"))
						),
						tr(
							th(div("File sent")),
							td(div("24/07/2014 13:09:22")),
							td(div("File sent"))
						),
						tr(
							th(div("Official")),
							td(div("24/07/2014 16:19:22")),
							td(div("Document accepted"))
						),
						tr(
							th(div("User")),
							td(div("24/07/2014 10:09:22")),
							td(div("Required modifications sent by user"))
						),
						tr(
							th(div("File sent")),
							td(div("24/07/2014 13:09:22")),
							td(div("File sent"))
						),
						tr(
							th(div("Official")),
							td(div("24/07/2014 16:19:22")),
							td(div("Document accepted"))
						)
					)
				)
			)
		);

		nextTick(function () { scrollBottom(scrollableElem); });

		section(
			{ class: 'submitted-preview' },
			source = div(
				{ class: 'section-primary submitted-preview-document' },
				div({ class: 'container-with-nav' },
					h3(span({ class: 'submitted-preview-item-number ' }, i("1")),
						span("Memorandum and articles of association lorem ipsum dolor sit")),
					div({ id: 'submitted-preview-navigation-top',
						class: 'submitted-preview-documents-navigation' },
						div(
							a({ class: 'previous' }, span({ class: 'fa fa-chevron-circle-left' }, "Previous")),
							span(span({ class: 'current-index' }, "1"),  " / 4"),
							a({ class: 'next' }, span({ class: 'fa fa-chevron-circle-right' }, "Next"))
						))),
				ul({ id: 'doc-previews', class: 'submitted-preview-image-placeholder' },
					li(img({ zoomOnHover: true, src: '/uploads/doc-a-sub-file2.idoc.png.jpg' })),
					li(img({ zoomOnHover: true, src: '/uploads/doc-a-sub-file1.idoc.jpg' })),
					li(img({ zoomOnHover: true, src: '/uploads/doc-b-sub-file1.idoc.jpg' }))),
				legacy('hashNavOrderedList', 'doc-previews', 'doc-preview'),
				div({ id: 'submitted-preview-navigation-bottom',
					class: 'submitted-preview-documents-navigation' },
					div(
						a({ class: 'previous' }, span({ class: 'fa fa-chevron-circle-left' }, "Previous")),
						span(span({ class: 'current-index' }, "1"),  " / 4"),
						a({ class: 'next' }, span({ class: 'fa fa-chevron-circle-right' }, "Next"))
					)),
				legacy('hashNavOrderedListControls', 'submitted-preview-navigation-top',
					'doc-previews', 'doc-preview'),
				legacy('hashNavOrderedListControls', 'submitted-preview-navigation-bottom',
					'doc-previews', 'doc-preview')
			),
			div({ class: 'section-primary submitted-preview-user-data' +
				' entity-data-section-side' },
				h2({ class: 'container-with-nav' }, "Application form"))
		);
	}
};
