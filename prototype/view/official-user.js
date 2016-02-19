'use strict';

var scrollBottom     = require('./utils/scroll-to-bottom'),
nextTick = require('next-tick');

exports._parent = require('./business-processes-table');

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		var scrollableElem;

		section(
			{ class: 'table-responsive-container' },
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
			div(

				{ class: 'section-primary' },
				h2({ class: 'container-with-nav' }, "Application history",
					a(
						{ class: 'hint-optional hint-optional-left',
							'data-hint': 'Print history of application',
							href: '/print-request-history/',
							target: '_blank' },
						span({ class: 'fa fa-print' }, "Print")
					)
					),
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
			)
		);
		section(
			{ class: 'section-tab-nav' },
			a({ class: 'section-tab-nav-tab', id: 'official-form', href: '/official/user-id/' },
				"Certificate of incorporation"
				),
			a({ class: 'section-tab-nav-tab',
				id: 'official-user-details', href: '/official/user-id/document/' },
				"Documents and data of petitioner"
				),

			div({ id: 'tab' })
		);
		nextTick(function () { scrollBottom(scrollableElem); });
	}
};
