'use strict';

exports['user-name'] = function () {
	text("Official");
};

exports['submitted-menu'] = function () {
	nav(
		{ class: 'items' },
		menuitem(
			a({ class: 'item-active' },
				"Official")
		),
		menuitem(
			a({ href: '/profile/' }, "Profile")
		)
	);
	nav(
		{ class: 'items' },
		menuitem(
			select({ class: 'role-select' },
					option("Role"),
					option("Official user"),
					option("Admin user"),
					option("User")
				)
		)
	);
};

exports['sub-main'] = function () {
	section(
		{ class: 'section-primary' },
		div(
			{ class: 'users-table-filter-bar' },
			form(
				label(
					"Status: "
				),
				div(
					select(
						option("Pending for revision"),
						option("Revisioned"),
						option("Todo")
					)
				),
				label(
					"Status: "
				),
				div(
					span({ class: 'input-append' },
							input({ type: 'search' }),
							button({ class: 'add-on' },
								span({ class: 'fa fa-search' })
								)
						)
				)
			),
			div(
				a({ class: 'print-button' }, "Print files list")
			)
		),
		table(
			{ class: 'official-users-table' },
			thead(
				tr(
					th("Name"),
					th("Application number"),
					th({ class: 'desktop-only' }, "Date of registration"),
					th("Requested registration"),
					th({ class: 'actions' }, "Actions")
				)
			),
			tbody(
				tr(
					td(
						div(a("John Watson"))
					),
					td(
						div("4068-50001-N-2013")
					),
					td(
						{ class: 'desktop-only' },
						div("23/07/2014 18:09:22")
					),
					td(
						div('Investment')
					),
					td(
						{ class: 'actions' },
						a("Download")
					)
				),
				tr(
					td(
						div(a("John Watson"))
					),
					td(
						div("4068-50001-N-2013")
					),
					td(
						{ class: 'desktop-only' },
						div("23/07/2014 18:09:22")
					),
					td(
						div('Investment')
					),
					td(
						{ class: 'actions' },
						a("Download")
					)
				),
				tr(
					td(
						div(a("John Watson"))
					),
					td(
						div("4068-50001-N-2013")
					),
					td(
						{ class: 'desktop-only' },
						div("23/07/2014 18:09:22")
					),
					td(
						div('Investment')
					),
					td(
						{ class: 'actions' },
						a("Download")
					)
				),
				tr(
					td(
						div(a("John Watson"))
					),
					td(
						div("4068-50001-N-2013")
					),
					td(
						{ 'class': 'desktop-only' },
						div("23/07/2014 18:09:22")
					),
					td(
						div('Investment')
					),
					td(
						{ class: 'actions' },
						a("Download")
					)
				),
				tr(
					td(
						div(a("John Watson"))
					),
					td(
						div("4068-50001-N-2013")
					),
					td(
						{ class: 'desktop-only' },
						div("23/07/2014 18:09:22")
					),
					td(
						div('Investment')
					),
					td(
						{ class: 'actions' },
						a("Download")
					)
				),
				tr(
					td(
						div(a("John Watson"))
					),
					td(
						div("4068-50001-N-2013")
					),
					td(
						{ 'class': 'desktop-only' },
						div("23/07/2014 18:09:22")
					),
					td(
						div('Investment')
					),
					td(
						{ class: 'actions' },
						a("Download")
					)
				),
				tr(
					td(
						div(a("John Watson"))
					),
					td(
						div("4068-50001-N-2013")
					),
					td(
						{ 'class': 'desktop-only' },
						div("23/07/2014 18:09:22")
					),
					td(
						div('Investment')
					),
					td(
						{ class: 'actions' },
						a("Download")
					)
				),
				tr(
					td(
						div(a("John Watson"))
					),
					td(
						div("4068-50001-N-2013")
					),
					td(
						{ 'class': 'desktop-only' },
						div("23/07/2014 18:09:22")
					),
					td(
						div('Investment')
					),
					td(
						{ class: 'actions' },
						a("Download")
					)
				),
				tr(
					td(
						div(a("John Watson"))
					),
					td(
						div("4068-50001-N-2013")
					),
					td(
						{ 'class': 'desktop-only' },
						div("23/07/2014 18:09:22")
					),
					td(
						div('Investment')
					),
					td(
						{ class: 'actions' },
						a("Download")
					)
				)
			)
		)
	);

};
