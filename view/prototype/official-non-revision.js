'use strict';

exports['sub-main'] = function () {
	section(
		{ 'class': 'submitted-main' },
		table(
			{ 'class': 'submitted-user-data-table table-responsive' },
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
					td(
						div({ 'class': 'cell-caption' },
							"Status"),
						div({ 'class': 'cell-body' },
							"Pending for revision")
					),
					td(
						div({ 'class': 'cell-caption' },
							"Application number"),
						div({ 'class': 'cell-body' },
							"4068-50001-N-2013")
					),
					td(
						div({ 'class': 'cell-caption' },
							"Application date"),
						div({ 'class': 'cell-body' },
							"23/07/2014 18:09:22")
					),
					td(
						div({ 'class': 'cell-caption' },
							"Requested registrations"),
						div({ 'class': 'cell-body' },
							span({ class: 'label-reg' }, "Brela"),
							span({ class: 'label-reg' }, "Tinc"),
							span({ class: 'label-reg' }, "Vat"),
							span({ class: 'label-reg' }, "Gepf"),
							span({ class: 'label-reg' }, "Nssf"),
							span({ class: 'label-reg' }, "Lapf")
							)
					),
					td(
						div({ 'class': 'cell-caption' },
							""),
						div({ 'class': 'cell-body' },
							a({ 'class': 'fa fa-download' }, "Print")
							)
					)
				)
			)
		)
	);
	section(
		{ 'class': 'section-primary' },
		div(
			h2("Application history"),
			a({ 'class': 'fa fa-print nav-alternatives' }, "Print"),
			table(
				{ 'class': 'submitted-user-history' },
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
					)
				)
			)
		)
	);
	section(
		{ class: 'section-primary section-tabs', id: 'incorporation-tabs' },
		a({ class: 'tab active' }, "Certificate of incorporation"),
		a({ class: 'tab', href: '/official/non-revision/user-id/articles-incorporation/' },
			"Documents and data of petitioner"),
		div(
			{ class: 'incorporation-form' },
			h3("Incorporation approved"),
			form(
				input({ type: 'number' }),
				input({ class: 'incorporation-number-submit', type: 'submit', value: 'Save' })
			),
			p("Upload here the certificates:"),
			p(
				{ class: 'incorporation-documents-upload' },
				button({ class: 'button-main ' }, "Certificate of incorporation"),
				button({ class: 'button-main ' }, "Registered articles of association")
			),
			hr(),
			h3("Request changes to the application"),
			form(
				ul(
					{ class: 'form-elements' },
					li(textarea({ placeholder: "Write request for changes here" }))
				),
				input({ type: 'submit', value: 'Send back for modyfications' })
			),
			hr(),
			h3("Reject application"),
			form(
				ul(
					{ class: 'form-elements' },
					li(textarea({ placeholder: "Reason of rejection" }))
				),
				input({ class: 'incorporation-rejection',
					type: 'submit', value: 'Reject the incorporation' })
			)
		)
	);
};
