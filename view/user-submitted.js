'use strict';

var syncStyle        = require('dom-ext/html-element/#/sync-style')
  , isVisual         = require('./utils/is-visual')
  , isMobileView     = require('./utils/is-mobile-view')
  , syncHeight       = require('./utils/sync-height')
  , scrollBottom     = require('./utils/scroll-to-bottom')
  , generateSections = require('./components/generate-sections')
  , nextTick = require('next-tick')
  , db               = require('mano').db

  , user = db.User.prototype
  , _  = require('mano').i18n.bind('User Submitted');

exports._parent = require('./user-base');

exports['submitted-menu'] = function () {
	li(a({ class: 'submitted-menu-item-active' }, "Request"));
};

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
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

		section({ class: 'section-primary' },
			h2(_("Documents")),
			hr(),
			h3(_("Documents required")),
			div(
				{ class: 'table-responsive-container' },
				table(
					{ class: 'submitted-user-data-table ' +
						'submitted-current-user-data-table user-request-table' },
					thead(
						tr(
							th(),
							th(_("Name")),
							th(_("Issuer")),
							th(_("Issue date")),
							th()
						)
					),
					tbody(
						tr(
							td('1'),
							td('Lorem ipsum dolor sit'),
							td('User'),
							td('01/01/2015'),
							td(span({ class: 'fa fa-search' }, _("Search")))
						)
					)
				)
			),
			h3(_("Payment receipts")),
			hr(),
			div(
				{ class: 'table-responsive-container' },
				table(
					{ class: 'submitted-user-data-table ' +
						'submitted-current-user-data-table user-request-table' },
					thead(
						tr(
							th(),
							th(_("Name")),
							th(_("Issuer")),
							th(_("Issue date")),
							th()
						)
					),
					tbody(
						tr(
							td('1'),
							td('Lorem ipsum dolor sit'),
							td('User'),
							td('01/01/2015'),
							td(span({ class: 'fa fa-search' }, _("Search")))
						)
					)
				)
			),
			h3(_("Certificates")),
			div(
				{ class: 'table-responsive-container' },
				table(
					{ class: 'submitted-user-data-table ' +
						'submitted-current-user-data-table user-request-table' },
					thead(
						tr(
							th(),
							th(_("Name")),
							th(_("Issuer")),
							th(_("Issue date")),
							th()
						)
					),
					tbody(
						tr(
							td(span({ class: 'fa fa-print' })),
							td('Lorem ipsum dolor sit'),
							td('User'),
							td('01/01/2015'),
							td(span({ class: 'fa fa-search' }, _("Search")))
						)
					)
				)
			));

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
						img({ src: '/uploads/doc-a-sub-file2.thumb.idoc.png.jpg' })
					)
				),
				li(
					a(
						span({ class: 'submitted-documents-thumbs-status ' +
							'submitted-documents-thumbs-error fa fa-exclamation ' }),
						img({ src: '/uploads/doc-a-sub-file1.thumb.idoc.jpg' })
					)
				),
				li(
					a(
						span({ class: 'submitted-documents-thumbs-status ' +
							'submitted-documents-thumbs-success fa fa-check ' }),
						img({ src: '/uploads/doc-b-sub-file1.thumb.idoc.jpg' })
					)
				),
				li(
					a(
						span({ class: 'submitted-documents-thumbs-status ' +
								'submitted-documents-thumbs-success fa fa-check ' }),
						img({ src: '/uploads/doc-a-sub-file2.thumb.idoc.png.jpg' })
					)
				))
		);
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
				elem = ul({ id: 'doc-previews', class: 'submitted-preview-image-placeholder' },
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
			target = div({ class: 'section-primary submitted-preview-user-data' +
					' entity-data-section-side' },
				h2({ class: 'container-with-nav' }, "Application form",
					a(
						{ class: 'hint-optional hint-optional-left',
							'data-hint': 'Print your application form',
							href: '/user-submitted/data-print/',
							target: '_blank' },
						span({ class: 'fa fa-print' }, "Print")
					)),

				generateSections(user.formSections))
		);

		if (isVisual) {
			syncStyle.call(target, source, 'height', isMobileView);
			syncHeight(elem);
		}
		nextTick(function () { scrollBottom(scrollableElem); });
	}
};
