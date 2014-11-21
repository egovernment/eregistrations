'use strict';

exports.main = function () {
	section(
		{ class: 'content statstics-tables' },
		table(
			thead(
				tr(
					th(),
					th(
						"a"
					),
					th(
						"b"
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
					th(
						"test"
					)
				)
			),
			tbody(
				tr(
					td("test"),
					td("123"),
					td("132"),
					td("534")
				),
				tr(
					td("test"),
					td("123"),
					td("132"),
					td("534")
				),
				tr(
					td("test"),
					td("123"),
					td("132"),
					td("534")
				),
				tr(
					td("test"),
					td("123"),
					td("132"),
					td("534")
				)
			)
		)
	);
};
