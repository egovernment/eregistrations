'use strict';

var syncStyle = require('dom-ext/html-element/#/sync-style');

exports['official-user-details'] = { class: { active: true } };

exports.tab = function () {
	var source,
			target;

	div(
		{ class: 'section-primary official-document' },
		h3(
			{ class: 'container-with-nav' },
			"Documents received from petitioner",
			div(
				a({ class: 'button' }, span({ class: 'fa fa-download' }), "View and print form"),
				a({ class: 'button' }, span({ class: 'fa fa-download' }), "Payment receipt")
			)
		),

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
			)
			),
		h3("Certificates uploaded by institutions"),
		ol({ class: 'submitted-documents-list' },
			li(
				a("Memorandum and articles of association")
			),
			li(
				a("Proof of identity for director 1")
			)
			),
		h3("Complete content of the company file"),
		ol({ class: 'submitted-documents-thumbs' },
			li(
				a(span({ class: 'review-status success fa fa-check ' }),
					img({ src: '/uploads/docASubFile2.thumb.idoc.png.jpg' })
					)
			),
			li(
				a(span({ class: 'review-status success fa fa-check ' }),
					img({ src: '/uploads/docASubFile1.thumb.idoc.jpg' })
					)
			),
			li(
				a(span({ class: 'review-status error fa fa-exclamation ' }),
					img({ src: '/uploads/docBSubFile1.thumb.idoc.jpg' })
					)
			),
			li(
				a(span({ class: 'review-status success fa fa-check ' }),
					img({ src: '/uploads/docASubFile2.thumb.idoc.png.jpg' })
					)
			)
			),
		section(
			{ class: 'submitted-preview' },
			source = div({ class: 'section-primary submitted-preview-document' },
				div({ class: 'container-with-nav' },
					h3(i({ class: 'list-item-number' }, "1"),
						"Memorandum and articles of association"
						),
					div({ class: 'submitted-preview-documents-navigation' },
						div(
							a(span({ class: 'fa fa-chevron-circle-left' }, "Previous")),
							span("1 / 4"),
							a(span({ class: 'fa fa-chevron-circle-right' }, "Next"))
						)
						)
					),
				img({ src: '/uploads/docASubFile2.idoc.png.jpg' }),
				div({ class: 'submitted-preview-documents-navigation' },
					div(
						a(span({ class: 'fa fa-chevron-circle-left' }, "Previous")),
						span("1 / 4"),
						a(span({ class: 'fa fa-chevron-circle-right' }, "Next"))
					)
					)
				),
			target = div({ class: 'section-primary submitted-preview-user-data' },
				h3({ class: 'container-with-nav' }, "Application form",
					a({ class: 'fa fa-print' }, "Print")
					),
				h4("Proposed company name"),
				table(
					tbody(
						tr(
							td("Blink IT Solutions")
						)
					)
				),
				h4("Business activity"),
				table(
					tbody(
						tr(
							th("Activity"),
							td("Air chater agent")
						),
						tr(
							th("Activity starting date"),
							td("7/30/2014")
						),
						tr(
							th("Date of account year end"),
							td("12/31/2014")
						),
						tr(
							th("Does the company have branches?"),
							td("Yes")
						)
					)
				),
				h4("Company secretary"),
				table(
					tbody(
						tr(
							th("Title"),
							td("Mr")
						),
						tr(
							th("First Name"),
							td("Andrei")
						),
						tr(
							th("Middle Name"),
							td("Mihai")
						),
						tr(
							th("Surname"),
							td("Balan")
						)
					)
				),
				h5("Residential address"),
				table(
					tbody(
						tr(
							th("Plot"),
							td("1")
						),
						tr(
							th("Block"),
							td("1")
						),
						tr(
							th("Street or location"),
							td("Nicolae Filipescu")
						),
						tr(
							th("City, district or town"),
							td("Bucharest")
						),
						tr(
							th("P.O. box"),
							td("1")
						),
						tr(
							th("Country"),
							td("Romania")
						)
					)
				),
				h4("Applicants"),
				h5("Marko Zagola"),
				h6("Personal data"),
				table(
					tbody(
						tr(
							th("Name"),
							td("Marko")
						),
						tr(
							th("Surname"),
							td("Zagalo")
						),
						tr(
							th("Document type"),
							td("X")
						),
						tr(
							th("Document number"),
							td("123")
						),
						tr(
							th("Marital status"),
							td("")
						),
						tr(
							th("Date of birth"),
							td("25-06-1991")
						),
						tr(
							th("Nationality"),
							td("Romanian")
						),
						tr(
							th("E-mail"),
							td("andrei.balan@blink-it.ro")
						)
					)
				),
				h6("Address"),
					table(
					tbody(
						tr(
							th("Address"),
							td("XXX")
						),
						tr(
							th("Number"),
							td("1")
						),
						tr(
							th("Postal code"),
							td("X")
						),
						tr(
							th("City"),
							td("Bucharest")
						),
						tr(
							th("Country"),
							td("Romania")
						)
					)
				)
				)
		)
	);
	syncStyle.call(target, source, 'height');
};
