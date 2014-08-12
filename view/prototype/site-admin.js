'use strict';

exports['user-name'] = function () {
	text("Site Admin");
};

exports['submitted-menu'] = function () {
	div(
		{ class: 'all-menu-items' },
		nav(
			{ class: 'items' },
			menuitem(
				a({ class: 'item-active' },
					"Application")
			),
			menuitem(
				a("Profile")
			)
		)
	);
};

exports['sub-main'] = function () {
	section(
		{ class: 'submitted-main' },
		div(
			a({ class: 'admin-new-user-add-button' }, "New User")
		),
		table(
			{ 'class': 'site-admin-data-table' },
			thead(
				tr(
					th("Email"),
					th("Institution"),
					th({ 'class': 'desktop-only' }, "Creation date")
				)
			),
			tbody(
				tr(
					td(
						div({ 'class': 'cell-body' },
							"john.watson@sherloc.com")
					),
					td(
						div({ 'class': 'cell-body' },
							"Bussines Licence A")
					),
					td(
						{ 'class': 'desktop-only' },
						div({ 'class': 'cell-body' },
							"23/07/2014 18:09:22")
					)
				),
				tr(
					td(
						div({ 'class': 'cell-body' },
							"john.watson@sherloc.com")
					),
					td(
						div({ 'class': 'cell-body' },
							"Bussines Licence A")
					),
					td(
						{ 'class': 'desktop-only' },
						div({ 'class': 'cell-body' },
							"23/07/2014 18:09:22")
					)
				),
				tr(
					td(
						div({ 'class': 'cell-body' },
							"john.watson@sherloc.com")
					),
					td(
						div({ 'class': 'cell-body' },
							"Bussines Licence A")
					),
					td(
						{ 'class': 'desktop-only' },
						div({ 'class': 'cell-body' },
							"23/07/2014 18:09:22")
					)
				),
				tr(
					td(
						div({ 'class': 'cell-body' },
							"john.watson@sherloc.com")
					),
					td(
						ul(
							li("Bussines Licence A"),
							li("Bussines Licence A"),
							li("Bussines Licence A"),
							li("Bussines Licence A")
						)
					),
					td(
						{ 'class': 'desktop-only' },
						div({ 'class': 'cell-body' },
							"23/07/2014 18:09:22")
					)
				),
				tr(
					td(
						div({ 'class': 'cell-body' },
							"john.watson@sherloc.com")
					),
					td(
						div({ 'class': 'cell-body' },
							"Bussines Licence A")
					),
					td(
						{ 'class': 'desktop-only' },
						div({ 'class': 'cell-body' },
							"23/07/2014 18:09:22")
					)
				),
				tr(
					td(
						div({ 'class': 'cell-body' },
							"john.watson@sherloc.com")
					),
					td(
						div({ 'class': 'cell-body' },
							"Bussines Licence A")
					),
					td(
						{ 'class': 'desktop-only' },
						div({ 'class': 'cell-body' },
							"23/07/2014 18:09:22")
					)
				)
			)
		)
	);
};
