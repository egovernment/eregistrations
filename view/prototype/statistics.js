'use strict';

exports['user-name'] = function () {
	text("Statistics");
};

exports['submitted-menu'] = function () {
	nav(
		ul(
			{ class: 'items' },
			li(
				a({ class: 'item-active', href: '/statistics/' },
					"Application")
			),
			li(
				a({ href: '/profile/' }, "Profile")
			)
		)
	);
};

exports['sub-main'] = function () {
	h2("Registrations statistics");
	section(
		{ class: 'statistics-table-dual' },
		table(
			{ class: 'statistics-table statistics-table-dual-main' },
			thead(
				tr(
					th(),
					th(
						span({ class: 'fa fa-user' }, "User")
					),
					th(
						span({ class: 'fa fa-users' }, "Users")
					),
					th(
						"Total"
					)
				)
			),
			tbody(
				tr(
					{ class: 'statstics-table-sub-header' },
					td("Total amount of users"),
					td("123"),
					td("132"),
					td("534")
				),
				tr(
					td("- individual"),
					td("123"),
					td("132"),
					td("534")
				),
				tr(
					td("- company"),
					td("123"),
					td("132"),
					td("534")
				),

				tr(
					{ class: 'statstics-table-sub-header' },
					td("Total registrations"),
					td("123"),
					td("132"),
					td("534")
				),
				tr(
					{ class: 'statstics-table-sub-sub-header' },
					td("Total registrations diviaded into sections"),
					td("123"),
					td("132"),
					td("534")
				),
				tr(
					td("- Lorem ipsum dolor sit amet,"),
					td("123"),
					td("132"),
					td("534")
				),
				tr(
					td("- Lorem ipsum dolor sit amet,"),
					td("123"),
					td("132"),
					td("534")
				),
				tr(
					td("- Lorem ipsum dolor sit amet, consectetur"),
					td("123"),
					td("132"),
					td("534")
				),
				tr(
					td("- Lorem ipsum dolor sit amet, consectetur adipiscing"),
					td("123"),
					td("132"),
					td("534")
				),
				tr(
					td("- Lorem ipsum dolor sit amet, consectetur adipiscing elit"),
					td("123"),
					td("132"),
					td("534")
				),
				tr(
					{ class: 'statstics-table-sub-sub-header' },
					td("Total registrations summary"),
					td("123"),
					td("132"),
					td("534")
				),
				tr(
					{ class: 'statstics-table-sub-header' },
					td("Total registrations diviaded into sections amount"),
					td("123"),
					td("132"),
					td("534")
				)
			)
		),
		table(
			{ class: 'statistics-table statistics-table-dual-aside' },
			thead(
				tr(
					th({ colspan: 2 }),
					th(span({ class: 'label-reg' }, "Wait")),
					th(span({ class: 'label-reg ready' }, "Proc.")),
					th(span({ class: 'label-reg approved' }, "Term.")),
					th(span({ class: 'label-reg info' }, "Total."))
				)
			),
			tbody(
				tr(
					{ class: 'statstics-table-sub-header' },
					td({ colspan: 2 }, span({ class: 'fa fa-user' }, "User"), " ", "Individual"),
					td("123"),
					td("132"),
					td("132"),
					td("534")
				),
				tr(
					td(span({ class: 'label-reg ' }, "NIT")),
					td(span({ class: 'label-reg ' }, "MH")),
					td("123"),
					td("132"),
					td("132"),
					td("534")
				),
				tr(
					td(span({ class: 'label-reg ' }, "NIT")),
					td(span({ class: 'label-reg ' }, "MH")),
					td("123"),
					td("132"),
					td("132"),
					td("534")
				),
				tr(
					td(span({ class: 'label-reg ' }, "NIT")),
					td(span({ class: 'label-reg ' }, "MH")),
					td("123"),
					td("132"),
					td("132"),
					td("534")
				),
				tr(
					td(span({ class: 'label-reg ' }, "NIT")),
					td(span({ class: 'label-reg ' }, "MH")),
					td("123"),
					td("132"),
					td("132"),
					td("534")
				),
				tr(
					{ class: 'statstics-table-sub-header' },
					td({ colspan: 2 }, span({ class: 'fa fa-users' }, "User"), " ", "Company"),
					td("123"),
					td("132"),
					td("132"),
					td("534")
				),
				tr(
					td(span({ class: 'label-reg ' }, "NIT")),
					td(span({ class: 'label-reg ' }, "MH")),
					td("123"),
					td("132"),
					td("132"),
					td("534")
				),
				tr(
					td(span({ class: 'label-reg ' }, "NIT")),
					td(span({ class: 'label-reg ' }, "MH")),
					td("123"),
					td("132"),
					td("132"),
					td("534")
				),
				tr(
					td(span({ class: 'label-reg ' }, "NIT")),
					td(span({ class: 'label-reg ' }, "MH")),
					td("123"),
					td("132"),
					td("132"),
					td("534")
				),
				tr(
					td(span({ class: 'label-reg ' }, "NIT")),
					td(span({ class: 'label-reg ' }, "MH")),
					td("123"),
					td("132"),
					td("132"),
					td("534")
				),
				tr(
					td(span({ class: 'label-reg ' }, "NIT")),
					td(span({ class: 'label-reg ' }, "MH")),
					td("123"),
					td("132"),
					td("132"),
					td("534")
				)
			)
		)
	);
};
