'use strict';

exports.body = function () {
	link({ href: '/prototype-print.css', rel: 'stylesheet' });

	exports._parent = require('./print-base');

	table(
		{ class: 'print-user-data' },
		thead(
			tr(
				th(
					{ colspan: 10 },
					span("Comerciante individual"),
					br(),
					span("Solicitud de inscripción para")
				),
				td(
					{ colspan: 2, rowspan: 2 }
				)
			),
			tr(
				th(
					{ colspan: 10 },
					"Tarjeta nit ante el ministerio de hacienda"
				)
			)
		),
		tbody(
			tr(
				{ class:  'print-user-data-header' },
				td(
					{ colspan: 12 },
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit. "
				)
			),

			tr(
				th(
					{ colspan: 2 },
					"Industry:"
				),
				td(
					{ colspan: 2 },
					span({ class: 'fa fa-check-square-o' }, "Checked")
				),
				th(
					{ colspan: 2 },
					"Lorem ipsum:"
				),
				td(
					{ colspan: 2 },
					"Yes",
					" ",
					span({ class: 'fa fa-check-square-o' }, "Checked"),
					"No",
					" ",
					span({ class: 'fa fa-check-square-o' }, "Checked")
				),
				th(
					{ colspan: 2 },
					"Lorem ipsum:"
				),
				td(
					{ colspan: 2 },
					"Lorem ipsum"
				)
			),
			tr(
				th(
					{ colspan: 2 },
					"Comerce:"
				),
				td(
					{ colspan: 2 },
					span({ class: 'fa fa-check-square-o' }, "Checked")
				),
				th(
					{ colspan: 2 },
					"Lorem ipsum:"
				),
				td(
					{ colspan: 2 },
					"Lorem ipsum"
				),
				td(
					{ colspan: 4 }
				)
			),
			tr(
				th(
					{ colspan: 2 },
					"Services:"
				),
				td(
					{ colspan: 2 },
					span({ class: 'fa fa-check-square-o' }, "Checked")
				),
				td(
					{ colspan: 4 }
				),
				td(
					{ colspan: 4 }
				)
			),
			tr(
				th(
					{ colspan: 2 },
					"Agriculture:"
				),
				td(
					{ colspan: 2 },
					span({ class: 'fa fa-check-square-o' }, "Checked")
				),
				td(
					{ colspan: 4 }
				),
				td(
					{ colspan: 4 }
				)
			),
			tr(
				{ class: 'print-user-data-section-end ' },
				th(
					{ colspan: 2 },
					"Other sector:"
				),
				td(
					{ colspan: 2 },
					span({ class: 'fa fa-check-square-o' }, "Checked")
				),
				td(
					{ colspan: 4 }
				),
				td(
					{ colspan: 4 }
				)
			),

			tr(
				{ class:  'print-user-data-header' },
				td(
					{ colspan: 12 },
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit. "
				)
			),

			tr(
				th(
					{ colspan: 4 },
					"Company name:"
				),
				th(
					{ colspan: 4 },
					"Company short name:"
				),
				th(
					{ colspan: 4 },
					"Type of bussiness:"
				)
			),
			tr(
				{ class: 'print-user-data-section-end ' },
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
				th(
					{ colspan: 2 },
					"Lorem ipsum dolor:"
				),
				td(
					{ colspan: 4 },
					"Lorem ipsum dolor sit amet"
				),
				th(
					{ colspan: 6 },
					"Lorem ipsum dolor sit amet"
				)
			),

			tr(
				th(
					{ colspan: 2 },
					"Lorem ipsum dolor:"
				),
				td(
					{ colspan: 4 },
					"Lorem ipsum dolor sit amet"
				),
				td(
					{ colspan: 6, rowspan: 4, class: 'print-user-data-section-single-end' },
					"Lorem ipsum dolor sit amet"
				)
			),
			tr(
				th(
					{ colspan: 2 },
					"Lorem ipsum dolor:"
				),
				td(
					{ colspan: 4 },
					"Lorem ipsum dolor sit amet"
				)
			),
			tr(
				th(
					{ colspan: 2 },
					"Lorem ipsum dolor:"
				),
				td(
					{ colspan: 4 },
					"Lorem ipsum dolor sit amet"
				)
			),
			tr(
				{ class: 'print-user-data-section-end ' },
				th(
					{ colspan: 2 },
					"Lorem ipsum dolor:"
				),
				td(
					{ colspan: 4 },
					"Lorem ipsum dolor sit amet"
				)
			),

			tr(
				th(
					{ colspan: 4 },
					"NIT:"
				),
				th(
					{ colspan: 4 },
					"NRC:"
				),
				td(
					{ colspan: 4, rowspan: 2 }
				)
			),
			tr(
				{ class: 'print-user-data-section-end ' },
				td(
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
					{ colspan: 4 },
					"Date:"
				),
				th(
					{ colspan: 4 },
					"Place:"
				),
				th(
					{ colspan: 4 },
					"Lorem ipsum dolor sit amet"
				)
			),
			tr(
				{ class: 'print-user-data-section-end ' },
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
					{ colspan: 4 },
					"Capital:"
				),
				th(
					{ colspan: 4 },
					"Shareholders:"
				),
				th(
					{ colspan: 4 },
					"Average income"
				)
			),
			tr(
				{ class: 'print-user-data-section-end ' },
				td(
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
				{ class:  'print-user-data-header' },
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
				{ class: 'print-user-data-header' },
				td(
					{ colspan: 12 },
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit. "
				)
			),
			tr(
				{ class: 'print-user-data-section-end ' },
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
