'use strict';

var syncStyle    = require('dom-ext/html-element/#/sync-style')
  , isMobileView = require('./utils/is-mobile-view')
  , syncHeight   = require('./utils/sync-height')
  , db           = require('mano').db
  , scrollBottom     = require('./utils/scroll-to-bottom')
  , nextTick = require('next-tick')
  , reject       = require('./_reject')

  , user = db.User.prototype;

exports._parent = require('./business-processes-table');

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		var source, target, elem, scrollableElem;

		section(
			{ class: 'submitted-main table-responsive-container' },
			table(
				{ class: 'submitted-user-data-table', responsive: true },
				thead(
					tr(
						th("Status"),
						th("Application number"),
						th("Application date"),
						th("Requested registrations"),
						th("")
					)
				),
				tbody(
					tr(
						td("Pending for revision"),
						td("4068-50001-N-2013"),
						td("23/07/2014 18:09:22"),
						td(
							span({ class: 'label-reg' }, "Brela"),
							span({ class: 'label-reg' }, "Tinc"),
							span({ class: 'label-reg' }, "Vat"),
							span({ class: 'label-reg' }, "Gepf"),
							span({ class: 'label-reg' }, "Nssf"),
							span({ class: 'label-reg' }, "Lapf")
						),
						td(
							a({ class: 'hint-optional hint-optional-left', 'data-hint': 'Download status' },
								span({ class: 'fa fa-download' }, "Download"))
						)
					)
				)
			)
		);
		section(
			{ class: 'section-primary' },
			h2({ class: 'container-with-nav' }, "Application history",
				a(
					{ class: 'hint-optional hint-optional-left',
						'data-hint': 'Print history of application',
						href: '/print-request-history/',
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
		section(
			{ class: 'section-primary' },
			insert(reject),
			h2("Application revision"),
			div({ class: 'official-submission-toolbar' },
				postButton({ buttonClass: 'button-main button-main-success', value: "Approve file" }),
				postButton({ buttonClass: 'button-main', value: "Send for corrections" }),
				a({ href: '#reject', class: 'button-main button-main-error' }, "Reject file")),
			h3("Required documents"),
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
			h3("Received documents"),
			ol({ class: 'submitted-documents-thumbs' },
				li(
					a(span({ class: 'submitted-documents-thumbs-status ' +
							'submitted-documents-thumbs-success fa fa-check ' }),
						img({ src: '/uploads/doc-a-sub-file2.thumb.idoc.png.jpg' }))
				),
				li(
					a(span({ class: 'submitted-documents-thumbs-status' +
							' submitted-documents-thumbs-success fa fa-check ' }),
						img({ src: '/uploads/doc-a-sub-file1.thumb.idoc.jpg' }))
				),
				li(
					a(span({ class: 'submitted-documents-thumbs-status ' +
							'submitted-documents-thumbs-error fa fa-exclamation ' }),
						img({ src: '/uploads/doc-b-sub-file1.thumb.idoc.jpg' }))
				),
				li(
					a(span({ class: 'submitted-documents-thumbs-status ' +
							'submitted-documents-thumbs-success fa fa-check ' }),
						img({ src: '/uploads/doc-a-sub-file2.thumb.idoc.png.jpg' }))
				))
		);
		section(
			{ class: 'submitted-preview' },
			source = div(
				{ class: 'section-primary submitted-preview-document' },
				div({ class: 'container-with-nav' },
					h3(span({ class: 'submitted-preview-item-number' }, i("1")),
						span("Memorandum and articles of association lorem ipsum dolor sit"))),
				elem = div({ class: 'submitted-preview-image-placeholder' },
					img({ zoomOnHover: true, src: '/uploads/doc-a-sub-file2.idoc.png.jpg' })),
				form(
					{ class: 'submitted-preview-form' },
					ul(
						{ class: 'form-elements' },
						li(label({ class: 'input-aside' },
							input({ dbjs: user._isARequested, type: 'checkbox' }), " ",
							span(user.getDescriptor('isBRequested').label))),
						li(div({ class: 'input' }, input({ dbjs: user._isValidated }))),
						li(
							div(
								{ class: 'dbjs-input-component' },
								label("Reject document: "),
								div(
									{ class: 'input official-form-document-revision-reject-reason' },
									select(
										option("Choose rejection reason: "),
										option("Document is not readable."),
										option("The document is not acurate or does not match the data of the form."),
										option("Other")
									),
									textarea()
								)
							)
						)
					),
					p(input({ type: 'submit' }, "Save"))
				)
			),
			target = div({ class: 'section-primary submitted-preview-user-data' +
					' entity-data-section-side' },
				h2({ class: 'container-with-nav' }, "Application form",
					a(
						{ class: 'hint-optional hint-optional-left',
							'data-hint': 'Print your application form',
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
		);
		syncStyle.call(target, source, 'height', isMobileView);
		syncHeight(elem);
		nextTick(function () { scrollBottom(scrollableElem); });
	}
};
