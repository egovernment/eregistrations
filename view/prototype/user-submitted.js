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
};
