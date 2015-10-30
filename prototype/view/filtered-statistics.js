'use strict';

exports._parent = require('../../view/user-base');

exports['submitted-menu'] = function () {
	li({ class: 'submitted-menu-item-active' }, a({ href: '/statistics/' }, "Statistics"));
};

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		section({ class: 'section-warning' },
			ul(li(p("This statistic page displays quantitative data on current states of inscription in" +
				" the system. You can filter the data with the filters on the left part of the page, the" +
				" table will then be updated. You can also print the stats sheet with the button below " +
				"the table."))));
		ul(
			{ class: 'pills-nav' },
			li({ class: 'pills-nav-active' }, a({ class: 'pills-nav-pill' }, "Lorem ipsum dolor amet")),
			li(a({ class: 'pills-nav-pill' }, "Lorem ipsum")),
			li(a({ class: 'pills-nav-pill' }, "Lorem ipsum dolor")),
			li(a({ class: 'pills-nav-pill' }, "Lorem ipsum")),
			li(a({ class: 'pills-nav-pill' }, "Lorem ipsum"))
		);
		section(
			{ class: 'statistics-table-dual' },
			section({ class: 'statistics-table-filters' },
				div({ class: 'statistics-table-filters-title' },
					span("Choose your filter(s)"),
					a("select all")),
				form(div({ class: 'statistics-table-filters-sub-section' },
						h3({ class: 'statistics-table-filters-sub-section-title' }, "Date range"),
						ul({ class: 'form-elements' },
							li(div({ class: 'dbjs-input-component' },
								div({ class: 'input' }, select(option("Choose date range"))))))),
					div({ class: 'statistics-table-filters-sub-section' },
						h3({ class: 'statistics-table-filters-sub-section-title' }, "Registrations"),
						ul({ class: 'form-elements' },
							li(label({ class: 'input-aside' },
								span(input({ type: 'checkbox' })),
								span("Lorem ipsum dolor sit amet, consectetur adipiscing elit."))),
							li(label({ class: 'input-aside' },
								span(input({ type: 'checkbox' })),
								span("Lorem ipsum dolor sit amet, consectetur adipiscing elit."))),
							li(label({ class: 'input-aside' },
								span(input({ type: 'checkbox' })),
								span("Lorem ipsum dolor sit amet, consectetur adipiscing elit."))),
							li(label({ class: 'input-aside' },
								span(input({ type: 'checkbox' })),
								span("Lorem ipsum dolor sit amet, consectetur adipiscing elit."))),
							li(label({ class: 'input-aside' },
								span(input({ type: 'checkbox' })),
								span("Lorem ipsum dolor sit amet, consectetur adipiscing elit."))),
							li(label({ class: 'input-aside' },
								span(input({ type: 'checkbox' })),
								span("Lorem ipsum dolor sit amet, consectetur adipiscing elit."))),
							li(label({ class: 'input-aside' },
								span(input({ type: 'checkbox' })),
								span("Lorem ipsum dolor sit amet, consectetur adipiscing elit."))),
							li(label({ class: 'input-aside' },
								span(input({ type: 'checkbox' })),
								span("Lorem ipsum dolor sit amet, consectetur adipiscing elit.")))
							)),
					div({ class: 'statistics-table-filters-sub-section' },
						h3({ class: 'statistics-table-filters-sub-section-title' }, "Turnover"),
						ul({ class: 'form-elements' },
							li(label({ class: 'input-aside' },
								span(input({ type: 'checkbox' })),
								span("0 - 1'000'000"))),
							li(label({ class: 'input-aside' },
								span(input({ type: 'checkbox' })),
								span("1'000'000 - 5'000'000"))),
							li(label({ class: 'input-aside' },
								span(input({ type: 'checkbox' })),
								span("5'000'000 - 15'000'000"))),
							li(label({ class: 'input-aside' },
								span(input({ type: 'checkbox' })),
								span("more than 15'000'000")))
							)),
					div({ class: 'statistics-table-filters-sub-section' },
						h3({ class: 'statistics-table-filters-sub-section-title' }, "Company type"),
						ul({ class: 'form-elements' },
							li(label({ class: 'input-aside' },
								span(input({ type: 'checkbox' })),
								span("Privet limited company"))),
							li(label({ class: 'input-aside' },
								span(input({ type: 'checkbox' })),
								span("Public Company"))),
							li(label({ class: 'input-aside' },
								span(input({ type: 'checkbox' })),
								span("Other")))
							)),
					div({ class: 'statistics-table-filters-sub-section' },
						h3({ class: 'statistics-table-filters-sub-section-title' }, "Sector"),
						ul({ class: 'form-elements' },
							li(div({ class: 'dbjs-input-component' },
								div({ class: 'input' }, select(option("Choose your activity")))))))),
				p(a({ class: 'button-regular statistics-table-filters-print' }, "Print stats sheet"))),
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
						{ class: 'statistics-table-sub-header' },
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
						{ class: 'statistics-table-sub-header' },
						td("Total registrations"),
						td("123"),
						td("132"),
						td("534")
					),
					tr(
						{ class: 'statistics-table-sub-sub-header' },
						td("Total registrations diviaded into sections"),
						td("123"),
						td("132"),
						td("534")
					),
					tr(
						td("Total registrations diviaded into sections"),
						td({ class: 'statistics-table-sensitive-data' }, "123"),
						td({ class: 'statistics-table-sensitive-data' }, "132"),
						td({ class: 'statistics-table-sensitive-data' }, "534")
					),
					tr(
						td("Total registrations diviaded into sections"),
						td({ class: 'statistics-table-sensitive-data' }, "123"),
						td({ class: 'statistics-table-sensitive-data' }, "132"),
						td({ class: 'statistics-table-sensitive-data' }, "534")
					),
					tr(
						{ class: 'statistics-table-nested-row' },
						td("- Lorem ipsum dolor sit amet,"),
						td("123"),
						td("132"),
						td("534")
					),
					tr(
						{ class: 'statistics-table-nested-row' },
						td("- Lorem ipsum dolor sit amet,"),
						td("123"),
						td("132"),
						td("534")
					),
					tr(
						{ class: 'statistics-table-nested-row' },
						td("- Lorem ipsum dolor sit amet, consectetur"),
						td("123"),
						td("132"),
						td("534")
					),
					tr(
						{ class: 'statistics-table-nested-row' },
						td("- Lorem ipsum dolor sit amet, consectetur adipiscing"),
						td("123"),
						td("132"),
						td("534")
					),
					tr(
						{ class: 'statistics-table-nested-row' },
						td("- Lorem ipsum dolor sit amet, consectetur adipiscing elit"),
						td("123"),
						td("132"),
						td("534")
					),
					tr(
						td("Total registrations diviaded into sections"),
						td({ class: 'statistics-table-sensitive-data' }, "123"),
						td({ class: 'statistics-table-sensitive-data' }, "132"),
						td({ class: 'statistics-table-sensitive-data' }, "534")
					),
					tr(
						{ class: 'statistics-table-nested-row' },
						td("- Lorem ipsum dolor sit amet,"),
						td("123"),
						td("132"),
						td("534")
					),
					tr(
						{ class: 'statistics-table-nested-row' },
						td("- Lorem ipsum dolor sit amet,"),
						td("123"),
						td("132"),
						td("534")
					),
					tr(
						{ class: 'statistics-table-nested-row' },
						td("- Lorem ipsum dolor sit amet, consectetur"),
						td("123"),
						td("132"),
						td("534")
					),
					tr(
						{ class: 'statistics-table-nested-row' },
						td("- Lorem ipsum dolor sit amet, consectetur adipiscing"),
						td("123"),
						td("132"),
						td("534")
					),
					tr(
						{ class: 'statistics-table-nested-row' },
						td("- Lorem ipsum dolor sit amet, consectetur adipiscing elit"),
						td("123"),
						td("132"),
						td("534")
					),
					tr(
						td("Total registrations diviaded into sections"),
						td({ class: 'statistics-table-sensitive-data' }, "123"),
						td({ class: 'statistics-table-sensitive-data' }, "132"),
						td({ class: 'statistics-table-sensitive-data' }, "534")
					),
					tr(
						{ class: 'statistics-table-nested-row' },
						td("- Lorem ipsum dolor sit amet,"),
						td("123"),
						td("132"),
						td("534")
					),
					tr(
						{ class: 'statistics-table-nested-row' },
						td("- Lorem ipsum dolor sit amet,"),
						td("123"),
						td("132"),
						td("534")
					),
					tr(
						{ class: 'statistics-table-nested-row' },
						td("- Lorem ipsum dolor sit amet, consectetur"),
						td("123"),
						td("132"),
						td("534")
					),
					tr(
						{ class: 'statistics-table-nested-row' },
						td("- Lorem ipsum dolor sit amet, consectetur adipiscing"),
						td("123"),
						td("132"),
						td("534")
					),
					tr(
						{ class: 'statistics-table-nested-row' },
						td("- Lorem ipsum dolor sit amet, consectetur adipiscing elit"),
						td("123"),
						td("132"),
						td("534")
					),
					tr(
						{ class: 'statistics-table-sub-sub-header' },
						td("Total registrations summary"),
						td("123"),
						td("132"),
						td("534")
					),
					tr(
						{ class: 'statistics-table-sub-header' },
						td("Total registrations diviaded into sections amount"),
						td("123"),
						td("132"),
						td("534")
					)
				)
			)
		);
	}
};
