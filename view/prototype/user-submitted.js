'use strict';

var syncStyle        = require('dom-ext/html-element/#/sync-style')
  , isVisual         = require('../utils/is-visual')
  , isMobileView     = require('../utils/is-mobile-view')
  , syncHeight       = require('../utils/sync-height')
  , scrollBottom     = require('../utils/scroll-to-bottom')
  , generateSections = require('../components/generate-sections')
  , db               = require('mano').db

  , user = db.User.prototype;

exports['user-name'] = function () {
	text("User Submited");
};

exports['submitted-menu'] = function () {
	nav(
		ul(
			{ class: 'submitted-menu-items' },
			li(
				a({ class: 'submitted-menu-item-active' },
					"Request")
			),
			li(
				a({ href: '/profile/' }, "Profile")
			)
		)
	);
};

exports['sub-main'] = function () {
	var source,
	target,
	elem,
	scrollableElem;

	section(
		{ class: 'submitted-main table-responsive-container' },
		table(
			{ class: 'submitted-user-data-table submitted-current-user-data-table', responsive: true },
			thead(
				tr(
					th("Status"),
					th("Company"),
					th("Application number"),
					th("Application date"),
					th("Requested registrations")
				)
			),
			tbody(
				tr(
					td("Pending for revision"),
					td("abstudios"),
					td("123"),
					td("29/07/2014"),
					td(
						span({ class: 'hint-optional hint-optional-left label-reg ready',
							'data-hint': 'Lorem ipsum dolor sit amet' },
							"Brela"),
						span({ class: 'hint-optional hint-optional-left label-reg rejected',
							'data-hint': 'Lorem ipsum dolor sit amet' }, "Tinc"),
						span({ class: 'hint-optional hint-optional-left label-reg approved',
							'data-hint': 'Lorem ipsum dolor sit amet' }, "Vat"),
						span({ class: 'hint-optional hint-optional-left label-reg',
							'data-hint': 'Lorem ipsum dolor sit amet' }, "Gepf"),
						span({ class: 'hint-optional hint-optional-left label-reg',
							'data-hint': 'Lorem ipsum dolor sit amet' }, "Nssf"),
						span({ class: 'hint-optional hint-optional-left label-reg',
							'data-hint': 'Lorem ipsum dolor sit amet' }, "Lapf")
					)
				)
			)
		)
	);
	section(
		{ class: 'section-primary' },
		h2({ class: 'container-with-nav' }, "History of your request",
			a(
				{ class: 'hint-optional hint-optional-left',
					'data-hint': 'Print history of Your request',
					href: '/user-submitted/history-print/' },
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
		),
		h3("Please correct folowing documents:"),
		section(
			ul(
				{ class: 'sections-primary-list user-documents-upload' },
				user.correctionDocuments,
				function (submission) {
					return li(
						form(
							div(
								h4(submission.label),
								small("Reason of rejaction: " + submission.legend),
								hr(),
								input({ dbjs: submission._files })
							)
						)
					);
				}
			)
		),
		hr(),
		postButton({ type: 'submit', value: 'Send corrected files' })
	);
	section(
		{ class: 'section-primary' },
		h3("Documents uploaded with the application"),
		ol({ class: 'submitted-documents-list' },
			li(
				a("Memorandum and articles of association")
			),
			li(
				a("Proof of identity for director 1")
			),
			li(
				a("Proof of identity for director 2")
			),
			li(
				a("Registered title deed")
			)),
		h3("Complete content of the company file"),
		ol({ class: 'submitted-documents-thumbs' },
			li(
				a(
					span({ class: 'submitted-documents-thumbs-status ' +
							'submitted-documents-thumbs-success fa fa-check ' }),
					img({ src: '/uploads/docASubFile2.thumb.idoc.png.jpg' })
				)
			),
			li(
				a(
					span({ class: 'submitted-documents-thumbs-status ' +
						'submitted-documents-thumbs-error fa fa-exclamation ' }),
					img({ src: '/uploads/docASubFile1.thumb.idoc.jpg' })
				)
			),
			li(
				a(
					span({ class: 'submitted-documents-thumbs-status ' +
						'submitted-documents-thumbs-success fa fa-check ' }),
					img({ src: '/uploads/docBSubFile1.thumb.idoc.jpg' })
				)
			),
			li(
				a(
					span({ class: 'submitted-documents-thumbs-status ' +
							'submitted-documents-thumbs-success fa fa-check ' }),
					img({ src: '/uploads/docASubFile2.thumb.idoc.png.jpg' })
				)
			))
	);
	section(
		{ class: 'submitted-preview' },
		source = div(
			{ class: 'section-primary submitted-preview-document' },
			div({ class: 'container-with-nav' },
				h3(i({ class: 'submitted-preview-item-number' }, "1"),
					"Memorandum and articles of association"),
				div({ id: 'submitted-preview-navigation-top',
					class: 'submitted-preview-documents-navigation' },
					div(
						a({ class: 'previous' }, span({ class: 'fa fa-chevron-circle-left' }, "Previous")),
						span(span({ class: 'current-index' }, "1"),  " / 4"),
						a({ class: 'next' }, span({ class: 'fa fa-chevron-circle-right' }, "Next"))
					))),
			elem = ul({ id: 'doc-previews', class: 'submitted-preview-image-placeholder' },
				li(img({ zoomOnHover: true, src: '/uploads/docASubFile2.idoc.png.jpg' })),
				li(img({ zoomOnHover: true, src: '/uploads/docASubFile1.idoc.jpg' })),
				li(img({ zoomOnHover: true, src: '/uploads/docBSubFile1.idoc.jpg' }))),
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
		target = div({ class: 'section-primary submitted-preview-user-data' +
				' entity-data-section-side' },
			h2({ class: 'container-with-nav' }, "Application form",
				a(
					{ class: 'hint-optional hint-optional-left',
						'data-hint': 'Print Your application form',
						href: '/user-submitted/data-print/' },
					span({ class: 'fa fa-print' }, "Print")
				)),

			generateSections(user.formSections))
	);

	if (isVisual) {
		syncStyle.call(target, source, 'height', isMobileView);
		syncHeight(elem);
	}
	scrollBottom(scrollableElem);
};
