'use strict';

var syncStyle = require('dom-ext/html-element/#/sync-style')
  , zoomOnHover = require('dom-ext/html-element/#/zoom-on-hover')
  , isMobileView = require('../utils/is-mobile-view')
  , syncHeight = require('../utils/sync-height')
  , db = require('mano').db
  , user = db.User.prototype
  , generateSections = require('../components/generate-sections');

exports['user-name'] = function () {
	text("User Submited");
};

exports['submitted-menu'] = function () {
	nav(
		ul(
			{ class: 'items' },
			li(
				a({ class: 'item-active' },
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
	elem;

	section(
		{ class: 'submitted-main' },
		table(
			{ class: 'submitted-user-data-table', responsive: true },
			thead(
				tr(
					th("Status"),
					th("Company"),
					th("Application number"),
					th("Application date"),
					th("Requested registrations"),
					th("")
				)
			),
			tbody(
				tr(
					td("Pending for revision"),
					td("abstudios"),
					td("123"),
					td("29/07/2014"),
					td(
						span({ class: 'label-reg' }, "Brela"),
						span({ class: 'label-reg' }, "Tinc"),
						span({ class: 'label-reg' }, "Vat"),
						span({ class: 'label-reg' }, "Gepf"),
						span({ class: 'label-reg' }, "Nssf"),
						span({ class: 'label-reg' }, "Lapf")
					),
					td(
						a(
							{ class: 'hint-optional hint-optional-left', 'data-hint': 'Download status' },
							span({ class: 'fa fa-download' }, "Download")
						)
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
					'data-hint': 'Print history of Your request' },
				span({ class: 'fa fa-print' }, "Print")
			)),
		table(
			{ class: 'submitted-user-history' },
			tbody(
				tr(
					th(
						div("User")
					),
					td(
						div("24/07/2014 10:09:22")
					),
					td(
						div("Required modifications sent by user")
					)
				),
				tr(
					th(
						div("File sent")
					),
					td(
						div("24/07/2014 13:09:22")
					),
					td(
						div("File sent")
					)
				),
				tr(
					th(
						div("Official")
					),
					td(
						div("24/07/2014 16:19:22")
					),
					td(
						div("Document accepted")
					)
				)
			)
		),
		h3("Please correct folowing documents:"),
		form(
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
			input({ type: 'submit', value: 'Send corrected files' })
		)
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
					span({ class: 'review-status success fa fa-check ' }),
					img({ src: '/uploads/docASubFile2.thumb.idoc.png.jpg' })
				)
			),
			li(
				a(
					span({ class: 'review-status error fa fa-exclamation ' }),
					img({ src: '/uploads/docASubFile1.thumb.idoc.jpg' })
				)
			),
			li(
				a(
					span({ class: 'review-status success fa fa-check ' }),
					img({ src: '/uploads/docBSubFile1.thumb.idoc.jpg' })
				)
			),
			li(
				a(
					span({ class: 'review-status success fa fa-check ' }),
					img({ src: '/uploads/docASubFile2.thumb.idoc.png.jpg' })
				)
			))
	);
	section(
		{ class: 'submitted-preview' },
		source = div(
			{ class: 'section-primary submitted-preview-document' },
			div({ class: 'container-with-nav' },
				h3(i({ class: 'list-item-number' }, "1"),
					"Memorandum and articles of association"),
				div({ class: 'submitted-preview-documents-navigation' },
					div(
						a(span({ class: 'fa fa-chevron-circle-left' }, "Previous")),
						span("1 / 4"),
						a(span({ class: 'fa fa-chevron-circle-right' }, "Next"))
					))),
			zoomOnHover.call(
				elem = div(
					{ class: 'image-placeholder' },
					img({ src: '/uploads/docASubFile2.idoc.png.jpg' })
				)
			),
			div({ class: 'submitted-preview-documents-navigation' },
				div(
					a(span({ class: 'fa fa-chevron-circle-left' }, "Previous")),
					span("1 / 4"),
					a(span({ class: 'fa fa-chevron-circle-right' }, "Next"))
				))
		),
		target = div({ class: 'section-primary submitted-preview-user-data' },
			h2({ class: 'container-with-nav' }, "Application form",
				a(
					{ class: 'hint-optional hint-optional-left',
						'data-hint': 'Print Your application form' },
					span({ class: 'fa fa-print' }, "Print")
				)),

			generateSections(user.formSections))
	);

	syncStyle.call(target, source, 'height', isMobileView);
	syncHeight(elem);
};
