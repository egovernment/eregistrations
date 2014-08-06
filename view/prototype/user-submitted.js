'use strict';

exports['sub-main'] = function () {
	section(
		{ 'class': 'submitted-main' },
		table(
			{ 'class': 'table-submitted' },
			thead(
				tr(
					th({ 'class': 'desktop-only' }, "Status"),
					th({ 'class': 'desktop-only' }, "Company"),
					th({ 'class': 'desktop-only' }, "Application number"),
					th({ 'class': 'desktop-only' }, "Application date"),
					th({ 'class': 'desktop-only' }, "Requested registrations"),
					th({ 'class': 'desktop-only' }, "")
				)
			),
			tbody(
				tr(
					td(
						span({ 'class': 'mobile-table-view-head' },
							"Status"),
						span({ 'class': 'mobile-table-view-body' },
							"Pending for revision")
					),
					td(
						span({ 'class': 'mobile-table-view-head' },
							"Company"),
						span({ 'class': 'mobile-table-view-body' },
							"abstudios")
					),
					td(
						span({ 'class': 'mobile-table-view-head' },
							"Application number"),
						span({ 'class': 'mobile-table-view-body' },
							"123")
					),
					td(
						span({ 'class': 'mobile-table-view-head' },
							"Application date"),
						span({ 'class': 'mobile-table-view-body' },
							"29/07/2014")
					),
					td(
						span({ 'class': 'mobile-table-view-head' },
							"Requested registrations"),
						span({ 'class': 'mobile-table-view-body' },
							"XXX YYY ZZZ EEE RRR TAG TAG TAG TAG")
					),
					td(
						span({ 'class': 'mobile-table-view-head' },
							""),
						span({ 'class': 'mobile-table-view-body' },
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
			h2("History of your request"),
			a({ 'class': 'fa fa-print nav-alternatives' }, "Print"),
			table(
				{ 'class': 'table-history' },
				tbody(
					tr(
						th(
							span("User")
						),
						td(
							span("abstudios")
						),
						td(
							span("123")
						)
					),
					tr(
						th(
							span("File sent")
						),
						td(
							span("abstudios")
						),
						td(
							span("123")
						)
					)
				)
			)
		)
	);
	section(
		{ 'class': 'section-primary' },
		div(
			h3("Documents uploaded with the application"),
			ol({ 'class': 'submitted-list-documents' },
				li(
					a({ 'href': '' }, "Memorandum and articles of association")
				),
				li(
					a({ 'href': '' }, "Proof of identity for director 1")
				),
				li(
					a({ 'href': '' }, "Proof of identity for director 2")
				),
				li(
					a({ 'href': '' }, "Registered title deed")
				)
				),
			h3("Complete content of the company file"),
			ol({ 'class': 'submitted-thumb-documents' },
				li(
					a({ 'href': '' },
						img({ 'src': '/uploads/docASubFile1.thumb.idoc.jpg' })
						)
				),
				li(
					a({ 'href': '' },
						img({ 'src': '/uploads/docASubFile2.thumb.idoc.png.jpg' })
						)
				),
				li(
					a({ 'href': '' },
						img({ 'src': '/uploads/docBSubFile1.thumb.idoc.jpg' })
						)
				)
				)
		)
	);
	section(
		{ 'class': 'section-primary revision' },
		div({ 'class': 'revision-document' },
			h3(
				i({ 'class': 'list-item-number' },
						"1"),
				"Memorandum and articles of association"
			),
			div({ 'class': 'revision-document-preview' },
				a({ 'href': '' },
					img({ 'src': '/uploads/docASubFile2.idoc.png.jpg' })
					)
				)
			),
		div({ 'class': 'revision-user' },
			h3("Application form"),
			a({ 'class': 'fa fa-print nav-alternatives' }, "Print"),
			h4("Proposed company name"),
			table(
				{ 'class': 'table-revision' },
				tbody(
					tr(
						td("Blink IT Solutions")
					)
				)
			),
			h4("Business activity"),
			table(
				{ 'class': 'table-revision' },
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
				{ 'class': 'table-revision' },
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
				{ 'class': 'table-revision' },
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
	);
};
