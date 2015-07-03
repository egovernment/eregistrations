'use strict';

exports._parent = require('../../view/user-base');

exports['submitted-menu'] = function () {
	li(a({ class: 'submitted-menu-item-active', href: '/statistics/' }, "Application"));
};

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		h2("Filterable statistics");
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
			section({ class: 'statistics-table-filters' }, "Filter section"),
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
