'use strict';

var syncStyle    = require('dom-ext/html-element/#/sync-style')
  , isMobileView = require('../utils/is-mobile-view')
  , syncHeight   = require('../utils/sync-height');

exports['official-user-details'] = { class: { active: true } };

exports.tab = function () {
	var source,
			target,
			elem;

	div(
		{ class: 'section-primary official-document' },
		div(
			{ class: 'container-with-nav' },
			h3("Documents received from petitioner"),
			div(
				a({ class: 'button-resource-link' },
					span({ class: 'fa fa-download' }), "View and print form"),
				a({ class: 'button-resource-link' },
					span({ class: 'fa fa-download' }), "Payment receipt")
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
				a(span(
					{ class: 'submitted-documents-thumbs-status' +
						' submitted-documents-thumbs-success fa fa-check ' }
				),
					img({ src: '/uploads/docASubFile2.thumb.idoc.png.jpg' })
					)
			),
			li(
				a(span({ class: 'submitted-documents-thumbs-status' +
						' submitted-documents-thumbs-success fa fa-check ' }),
					img({ src: '/uploads/docASubFile1.thumb.idoc.jpg' })
					)
			),
			li(
				a(span({ class: 'submitted-documents-thumbs-status' +
						' submitted-documents-thumbs-error fa fa-exclamation ' }),
					img({ src: '/uploads/docBSubFile1.thumb.idoc.jpg' })
					)
			),
			li(
				a(span({ class: 'submitted-documents-thumbs-status' +
						' submitted-documents-thumbs-success fa fa-check ' }),
					img({ src: '/uploads/docASubFile2.thumb.idoc.png.jpg' })
					)
			)
			),
		section(
			{ class: 'submitted-preview' },
			source = div({ class: 'section-primary submitted-preview-document' },
				div({ class: 'container-with-nav' },
					h3(i({ class: 'submitted-preview-item-number' }, "1"),
						"Memorandum and articles of association"
						)
					),
				elem = ul({ class: 'submitted-preview-image-placeholder' },
					li({ class: 'active' },
						img({ zoomOnHover: true, src: '/uploads/docASubFile2.idoc.png.jpg' })))),
			target = div({ class: 'section-primary submitted-preview-user-data' },
				h2({ class: 'container-with-nav' }, "Application form",
					a(
						{ class: 'hint-optional hint-optional-left',
							'data-hint': 'Print Your application form',
							href: '/user-submitted/data-print/' },
						span({ class: 'fa fa-print' }, "Print")
					)),

				section(
					{ class: 'entity-data-section' },
					h3("Proposed company name"),
					table(
						tbody(
							tr(
								td("Blink IT Solutions")
							)
						)
					)
				),
				section(
					{ class: 'entity-data-section' },
					h3("Business activity"),
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
					)
				),
				section(
					{ class: 'entity-data-section' },
					h3("Company secretary"),
					section(
						{ class: 'entity-data-section-sub' },
						h4("Basic secretary data"),
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
						)
					),
					section(
						{ class: 'entity-data-section-sub' },
						h4("Residential address"),
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
						)
					)
				),
				section(
					{ class: 'entity-data-section' },
					h3("Applicants"),
					ul(
						{ class: 'entity-data-section-entities' },
						li(
							h4("Marko Zagola"),
							section(
								{ class: 'entity-data-section' },
								h5("Personal data"),
								section(
									{ class: 'entity-data-section-sub' },
									h6("Basic data"),
									table(
										tbody(
											tr(
												th("Name"),
												td("Marko")
											),
											tr(
												th("Surname"),
												td("Zagalo")
											)
										)
									)
								),
								section(
									{ class: 'entity-data-section-sub' },
									h6("Additional data"),
									table(
										tbody(
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
									)
								),
								section(
									{ class: 'entity-data-section-sub' },
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
						),
						li(
							h4("Frank Grozel"),
							section(
								{ class: 'entity-data-section' },
								h5("Additional data"),
								table(
									tbody(
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
								)
							)
						)
					)
				)
				)
		)
	);
	syncStyle.call(target, source, 'height', isMobileView);
	syncHeight(elem);
};
