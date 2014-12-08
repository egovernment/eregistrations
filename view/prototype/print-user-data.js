'use strict';

exports['print-page-title'] = function () {
	h2("User Data");
	p("19/11/2015");
};

exports.main = function () {
	table(
		{ class: 'print-user-data' },
		thead(
			tr(
				th(
					{ colspan: 12 },
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit. "
				)
			),
			tr(
				th(
					{ colspan: 12 },
					"Lorem ipsum dolor sit"
				)
			)
		),
		tbody(
			tr(
				{ class:  'print-user-data-sub-header' },
				td(
					{ colspan: 12 },
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit. "
				)
			),
			tr(
				{ class:  'print-user-data-document' },
				td(
					{ colspan: 12 },
					span({ class: 'fa fa-check-square-o' }, "Checked"),
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
					span("(502)")
				)
			),
			tr(
				{ class:  'print-user-data-document' },
				td(
					{ colspan: 12 },
					span({ class: 'fa fa-check-square-o' }, "Checked"),
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
					span("(502)")
				)
			),
			tr(
				{ class:  'print-user-data-document' },
				td(
					{ colspan: 12 },
					span({ class: 'fa fa-check-square-o' }, "Checked"),
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
					span("(502)")
				)
			),
			tr(
				{ class:  'print-user-data-document' },
				td(
					{ colspan: 12 },
					span({ class: 'fa fa-check-square-o' }, "Checked"),
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
					span("(502)")
				)
			),
			tr(
				{ class:  'print-user-data-document' },
				td(
					{ colspan: 12 },
					span({ class: 'fa fa-check-square-o' }, "Checked"),
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
					span("(502)")
				)
			),

			tr(
				{ class:  'print-user-data-sub-header' },
				td(
					{ colspan: 12 },
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit. "
				)
			),
			tr(
				td(
					{ colspan: 4, class:  'print-user-data-sub-sub-elem' },
					"Company name:"
				),
				td(
					{ colspan: 4, class:  'print-user-data-sub-sub-elem' },
					"Company short name:"
				),
				td(
					{ colspan: 4, class:  'print-user-data-sub-sub-elem' },
					"Type of bussiness:"
				)
			),
			tr(
				td(
					{ colspan: 4 },
					"Lorem ipsum"
				),
				td(
					{ colspan: 4 },
					"Lorem"
				),
				td(
					{ colspan: 4 },
					"AV"
				)
			),

			tr(
				td(),
				td(),
				td(),
				td(),
				td(),
				td(),
				td(),
				td(),
				td(),
				td(),
				td(),
				td()
			)
		),
		tfoot("c")
	);
};
