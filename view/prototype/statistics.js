'use strict';

exports.main = function () {
	section(
		{ class: 'content statstics-tables' },
		table(
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
			thead(
				tr(
					th(),
					th(span({ class: 'label-reg ready' }, "Wait")),
					th(span({ class: 'label-reg approved' }, "Proc.")),
					th(span({ class: 'label-reg rejected' }, "Term.")),
					th(span({ class: 'label-reg ' }, "Total."))
				)
			),
			tbody(
				tr(
					{ class: 'statstics-table-sub-header' },
					td(span({ class: 'fa fa-user' }, "User"), " ", "Individual"),
					td("123"),
					td("132"),
					td("132"),
					td("534")
				),
				tr(
					td(span({ class: 'label-reg ' }, "NIT"), span({ class: 'label-reg ' }, "MH")),
					td("123"),
					td("132"),
					td("132"),
					td("534")
				),
				tr(
					td(span({ class: 'label-reg ' }, "NIT"), span({ class: 'label-reg ' }, "MH")),
					td("123"),
					td("132"),
					td("132"),
					td("534")
				),
				tr(
					td(span({ class: 'label-reg ' }, "NIT"), span({ class: 'label-reg ' }, "MH")),
					td("123"),
					td("132"),
					td("132"),
					td("534")
				),
				tr(
					td(span({ class: 'label-reg ' }, "NIT"), span({ class: 'label-reg ' }, "MH")),
					td("123"),
					td("132"),
					td("132"),
					td("534")
				),
				tr(
					{ class: 'statstics-table-sub-header' },
					td(span({ class: 'fa fa-users' }, "User"), " ", "Company"),
					td("123"),
					td("132"),
					td("132"),
					td("534")
				),
				tr(
					td(span({ class: 'label-reg ' }, "NIT"), span({ class: 'label-reg ' }, "MH")),
					td("123"),
					td("132"),
					td("132"),
					td("534")
				),
				tr(
					td(span({ class: 'label-reg ' }, "NIT"), span({ class: 'label-reg ' }, "MH")),
					td("123"),
					td("132"),
					td("132"),
					td("534")
				),
				tr(
					td(span({ class: 'label-reg ' }, "NIT"), span({ class: 'label-reg ' }, "MH")),
					td("123"),
					td("132"),
					td("132"),
					td("534")
				),
				tr(
					td(span({ class: 'label-reg ' }, "NIT"), span({ class: 'label-reg ' }, "MH")),
					td("123"),
					td("132"),
					td("132"),
					td("534")
				)
			)
		)
	);
};
