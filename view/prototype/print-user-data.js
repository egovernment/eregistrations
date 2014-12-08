'use strict';

exports.body = function () {
	link({ href: '/prototype-print.css', rel: 'stylesheet' });

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
				td(
					{ colspan: 2, class:  'print-user-data-sub-sub-elem' },
					"Lorem ipsum dolor:"
				),
				td(
					{ colspan: 4 },
					"Lorem ipsum dolor sit amet"
				),
				td(
					{ colspan: 6, class:  'print-user-data-sub-sub-elem' },
					"Lorem ipsum dolor sit amet"
				)
			),

			tr(
				th(
					{ colspan: 2, class:  'print-user-data-sub-sub-elem' },
					"Lorem ipsum dolor:"
				),
				td(
					{ colspan: 4 },
					"Lorem ipsum dolor sit amet"
				),
				th(
					{ colspan: 6, rowspan: 4 },
					"Lorem ipsum dolor sit amet"
				)
			),
			tr(
				th(
					{ colspan: 2, class:  'print-user-data-sub-sub-elem' },
					"Lorem ipsum dolor:"
				),
				td(
					{ colspan: 4 },
					"Lorem ipsum dolor sit amet"
				)
			),
			tr(
				th(
					{ colspan: 2, class:  'print-user-data-sub-sub-elem' },
					"Lorem ipsum dolor:"
				),
				td(
					{ colspan: 4 },
					"Lorem ipsum dolor sit amet"
				)
			),
			tr(
				td(
					{ colspan: 2, class:  'print-user-data-sub-sub-elem' },
					"Lorem ipsum dolor:"
				),
				td(
					{ colspan: 4 },
					"Lorem ipsum dolor sit amet"
				)
			),

			tr(
				th(
					{ colspan: 4, class:  'print-user-data-sub-sub-elem' },
					"NIT:"
				),
				td(
					{ colspan: 4, class:  'print-user-data-sub-sub-elem' },
					"NRC:"
				),
				td(
					{ colspan: 4, rowspan: 2 }
				)
			),
			tr(
				th(
					{ colspan: 4 },
					"234523523542345"
				),
				td(
					{ colspan: 4 },
					"23452352345345345"
				)
			),

			tr(
				th(
					{ colspan: 4, class:  'print-user-data-sub-sub-elem' },
					"Date:"
				),
				td(
					{ colspan: 4, class:  'print-user-data-sub-sub-elem' },
					"Place:"
				),
				td(
					{ colspan: 4, class:  'print-user-data-sub-sub-elem' },
					"Lorem ipsum dolor sit amet"
				)
			),
			tr(
				th(
					{ colspan: 4 },
					"13.12.2014"
				),
				td(
					{ colspan: 4 },
					"Lorem ipsum"
				),
				td(
					{ colspan: 4 },
					"Lorem ipsum"
				)
			),

			tr(
				th(
					{ colspan: 4, class:  'print-user-data-sub-sub-elem' },
					"Capital:"
				),
				td(
					{ colspan: 4, class:  'print-user-data-sub-sub-elem' },
					"Shareholders:"
				),
				td(
					{ colspan: 4, class:  'print-user-data-sub-sub-elem' },
					"Average income"
				)
			),
			tr(
				th(
					{ colspan: 4 },
					"200 000"
				),
				td(
					{ colspan: 4 },
					"10"
				),
				td(
					{ colspan: 4 },
					"20 000"
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
				{ class: 'print-user-data-entities' },
				td(
					{ colspan: 5 },
					"Name of shareholder"
				),
				td(
					{ colspan: 2 },
					"Is legal representant?"
				),
				td(
					"% of shares"
				),
				td("Amount"),
				td({ colspan: 3 }, "Value")
			),
			tr(
				{ class: 'print-user-data-entities-entity' },
				td({ colspan: 5 }, "Frank Grozel"),
				td({ colspan: 2 }, "Yes"),
				td('50%'),
				td('10'),
				td("$"),
				td({ colspan: 2 }, "1,000.00")
			),
			tr(
				{ class: 'print-user-data-entities-entity' },
				td({ colspan: 5 }, "Frank Grozel"),
				td({ colspan: 2 }, "Yes"),
				td('50%'),
				td('10'),
				td("$"),
				td({ colspan: 2 }, "1,000.00")
			),
			tr(
				{ class: 'print-user-data-entities-sumary' },
				td({ colspan: 7 }),
				td('100%'),
				td('20'),
				td("$"),
				td({ colspan: 2 }, "2,000.00")
			),

			tr(
				{ class: 'print-user-data-sub-header' },
				td(
					{ colspan: 12 },
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit. "
				)
			),
			tr(
				td(
					{ colspan: 12 },
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse molestie, neque " +
						"sed dignissim ultricies, odio mi porta tellus, blandit accumsan odio ipsum in sem. " +
						"Fusce non rhoncus ante, at vulputate odio. Pellentesque vitae pretium ligula. Donec" +
						" non iaculis metus. "
				)
			),
			tr(
				td(
					{ colspan: 4 },
					span({ class: 'print-user-data-signature' }, "Your signature")

				),
				td(
					{ colspan: 4 },
					span({ class: 'print-user-data-signature' }, "Your company name")
				),
				td(
					{ colspan: 4 }
				)
			)
		)
	);
};
