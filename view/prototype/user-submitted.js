'use strict';

exports['sub-main'] = function () {
	section(
		{ 'class': 'section-submitted' },
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
					td({ 'class': '' },
						span({ 'class': 'mobile-table-view' },
							"Status"),
						span({ 'class': 'mobile-table-view-2' },
							"Pending for revision")
						),
					td({ 'class': '' },
						span({ 'class': 'mobile-table-view' },
							"Company"),
						span({ 'class': 'mobile-table-view-2' },
							"abstudios")
						),
					td({ 'class': '' },
						span({ 'class': 'mobile-table-view' },
							"Application number"),
						span({ 'class': 'mobile-table-view-2' },
							"123")
						),
					td({ 'class': '' },
						span({ 'class': 'mobile-table-view' },
							"Application date"),
						span({ 'class': 'mobile-table-view-2' },
							"29/07/2014")
						),
					td({ 'class': '' },
						span({ 'class': 'mobile-table-view' },
							"Requested registrations"),
						span({ 'class': 'mobile-table-view-2' },
							"XXX YYY ZZZ EEE RRR TAG TAG TAG TAG")
						),
					td({ 'class': '' },
						span({ 'class': 'mobile-table-view' },
							""),
						span({ 'class': 'mobile-table-view-2' },
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
			a({ 'class': 'fa fa-print top-right' }, "Print"),
			table(
				{ 'class': 'table-history' },
				tbody(
					tr(
						th({ 'class': '' },
							span({ 'class': '' },
								"User")
							),
						td({ 'class': '' },
							span({ 'class': '' },
								"abstudios")
							),
						td({ 'class': '' },
							span({ 'class': '' },
								"123")
							)
					),
					tr(
						th({ 'class': '' },
							span({ 'class': '' },
								"File sent")
							),
						td({ 'class': '' },
							span({ 'class': '' },
								"abstudios")
							),
						td({ 'class': '' },
							span({ 'class': '' },
								"123")
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
			ol({ 'class': 'list-docs' },
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
			ol({ 'class': 'thumb-docs' },
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
				),
				li(
					a({ 'href': '' },
						img({ 'src': '/img/doc-image-thumb.png' })
						)
				)
				)
		)
	);
	section(
		{ 'class': 'section-primary revision-content' },
		div({ 'class': 'revision-document' },
			h3(
				i({ 'class': 'document-number' },
						("1")),
				"Memorandum and articles of association"
			),
			ul({ 'class': 'image-docs' },
				li(
					a({ 'href': '' },
						img({ 'src': '/uploads/docASubFile2.idoc.png.jpg' })
						)
				)
				)
			),
		div({ 'class': 'revision-user' },
			h3("Application form"),
			a({ 'class': 'fa fa-print top-right' }, "Print"),
			h4("Proposed company name"),
			table(
				{ 'class': 'table-revision' },
				tbody(
					tr(
						td({ 'class': '' }, "Blink IT Solutions")
					)
				)
			),
			h4("Business activity"),
			table(
				{ 'class': 'table-revision' },
				tbody(
					tr(
						th({ 'class': '' }, "Activity"),
						td({ 'class': '' }, "Air chater agent")
					),
					tr(
						th({ 'class': '' }, "Activity starting date"),
						td({ 'class': '' }, "7/30/2014")
					),
					tr(
						th({ 'class': '' }, "Date of account year end"),
						td({ 'class': '' }, "12/31/2014")
					),
					tr(
						th({ 'class': '' }, "Does the company have branches?"),
						td({ 'class': '' }, "Yes")
					)
				)
			),
			h4("Company secretary"),
			table(
				{ 'class': 'table-revision' },
				tbody(
					tr(
						th({ 'class': '' }, "Title"),
						td({ 'class': '' }, "Mr")
					),
					tr(
						th({ 'class': '' }, "First Name"),
						td({ 'class': '' }, "Andrei")
					),
					tr(
						th({ 'class': '' }, "Middle Name"),
						td({ 'class': '' }, "Mihai")
					),
					tr(
						th({ 'class': '' }, "Surname"),
						td({ 'class': '' }, "Balan")
					)
				)
			),
			h5("Residential address"),
			table(
				{ 'class': 'table-revision' },
				tbody(
					tr(
						th({ 'class': '' }, "Plot"),
						td({ 'class': '' }, "1")
					),
					tr(
						th({ 'class': '' }, "Block"),
						td({ 'class': '' }, "1")
					),
					tr(
						th({ 'class': '' }, "Street or location"),
						td({ 'class': '' }, "Nicolae Filipescu")
					),
					tr(
						th({ 'class': '' }, "City, district or town"),
						td({ 'class': '' }, "Bucharest")
					),
					tr(
						th({ 'class': '' }, "P.O. box"),
						td({ 'class': '' }, "1")
					),
					tr(
						th({ 'class': '' }, "Country"),
						td({ 'class': '' }, "Romania")
					)
				)
			)
			)
	);
};
