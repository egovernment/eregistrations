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
							"D")
						)
				)
			)
		)
	);
	section(
		{ 'class': 'section-primary' },
		div(
			h2("History of your request"),
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
			ol({ 'class': 'documents' },
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
						img({ 'src': '/img/doc-image-thumb.png' })
						)
				),
				li(
					a({ 'href': '' },
						img({ 'src': '/img/doc-image-thumb.png' })
						)
				),
				li(
					a({ 'href': '' },
						img({ 'src': '/img/doc-image-thumb.png' })
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
			h3("Memorandum and articles of association"),
			ol({ 'class': 'image-docs' },
				li(
					a({ 'href': '' },
						img({ 'src': '/img/doc-image.png' })
						)
				)
				)
			),
		div({ 'class': 'revision-user' },
			h3("Application form")
			)
	);
};
