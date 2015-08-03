'use strict';

var  _       = require('mano').i18n.bind('Official: Revision')
, all = require('eregistrations/business-processes').filterByKey('isRevisionReady', true)
	.filterByKey('isApplicationResolved', false)
, memoize = require('memoizee/plain');

module.exports = exports = require('../../view/official');

exports['submitted-menu'] = function () {
	li(a({ class: 'submitted-menu-item-active' }, "Official"));
	li(postButton({ value: "Role" }));
};

exports._statusMap = memoize(function (institution) {
	var users = all.filterByKey('revisionInstitution', institution);

	return {
		todos: {
			data: users,
			label: _("All"),
			order: 1
		},
		'': {
			data: users.filterByKey('isRevisionPending', true),
			label: _("Pending review"),
			order: 2
		},
		'mandado-para-correciones': {
			data: users.filterByKey('isRevisionSentBack', true),
			label: _("Sent for corrections"),
			order: 3
		},
		rechazado: {
			data: users.filterByKey('isRevisionApproved', false),
			label: _("Rejected"),
			order: 4
		},
		aprobado: {
			data: users.filterByKey('isRevisionApproved', true),
			label: _("Approved"),
			order: 5
		}
	};
});

exports._usersTable = function () {
	return [ul(
		{ class: 'pagination' },
		li(a("<<")),
		li(a("<")),
		li({ class: 'pagination-active' }, a("1")),
		li(a("2")),
		li(a("3")),
		li(a("4")),
		li(a("5")),
		li(a("6")),
		li(a("7")),
		li(a("8")),
		li(a("9")),
		li(a("10")),
		li(a("11")),
		li(a("12")),
		li(a("13")),
		li(a("14")),
		li(a("15")),
		li(a("16")),
		li(a(">")),
		li(a(">>"))
	),

		div(
			{ class: 'table-responsive-container' },
			table(
				{ class: 'submitted-user-data-table' },
				thead(
					tr(
						th("User"),
						th({ class: 'desktop-only' }, "Application number"),
						th({ class: 'desktop-only' }, "Date of registration"),
						th("Requested registration"),
						th({ class: 'actions' }, "Actions")
					)
				),
				tbody(
					tr(
						td(
							{ class: 'submitted-user-data-table-basic' },
							a({ href: '/official/user-id/' }, "John Watson",
								span('johnwatson@gmail.com')
								)
						),
						td(
							{ class: 'desktop-only' },
							a({ href: '/official/user-id/' }, "4068-50001-N-2013")
						),
						td(
							{ class: 'desktop-only' },
							a({ href: '/official/user-id/' }, "23/07/2014 18:09:22")
						),
						td(
							a({ href: '/official/user-id/' }, "Investment")
						),
						td(
							{ class: 'actions' },
							a(span({ class: 'fa fa-download' }, "Download"))
						)
					),
					tr(
						td(
							{ class: 'submitted-user-data-table-basic' },
							a({ href: '/official/user-id/' }, "John Watson",
								span('johnwatson@gmail.com')
								)
						),
						td(
							{ class: 'desktop-only' },
							a({ href: '/official/user-id/' }, "4068-50001-N-2013")
						),
						td(
							{ class: 'desktop-only' },
							a({ href: '/official/user-id/' }, "23/07/2014 18:09:22")
						),
						td(
							a({ href: '/official/user-id/' }, "Investment")
						),
						td(
							{ class: 'actions' },
							a(span({ class: 'fa fa-download' }, "Download"))
						)
					),
					tr(
						td(
							{ class: 'submitted-user-data-table-basic' },
							a({ href: '/official/user-id/' }, "John Watson",
								span('johnwatson@gmail.com')
								)
						),
						td(
							{ class: 'desktop-only' },
							a({ href: '/official/user-id/' }, "4068-50001-N-2013")
						),
						td(
							{ class: 'desktop-only' },
							a({ href: '/official/user-id/' }, "23/07/2014 18:09:22")
						),
						td(
							a({ href: '/official/user-id/' }, "Investment")
						),
						td(
							{ class: 'actions' },
							a(span({ class: 'fa fa-download' }, "Download"))
						)
					),
					tr(
						td(
							{ class: 'submitted-user-data-table-basic' },
							a({ href: '/official/user-id/' }, "John Watson",
								span('johnwatson@gmail.com')
								)
						),
						td(
							{ class: 'desktop-only' },
							a({ href: '/official/user-id/' }, "4068-50001-N-2013")
						),
						td(
							{ class: 'desktop-only' },
							a({ href: '/official/user-id/' }, "23/07/2014 18:09:22")
						),
						td(
							a({ href: '/official/user-id/' }, "Investment")
						),
						td(
							{ class: 'actions' },
							a(span({ class: 'fa fa-download' }, "Download"))
						)
					),
					tr(
						td(
							{ class: 'submitted-user-data-table-basic' },
							a({ href: '/official/user-id/' }, "John Watson",
								span('johnwatson@gmail.com')
								)
						),
						td(
							{ class: 'desktop-only' },
							a({ href: '/official/user-id/' }, "4068-50001-N-2013")
						),
						td(
							{ class: 'desktop-only' },
							a({ href: '/official/user-id/' }, "23/07/2014 18:09:22")
						),
						td(
							a({ href: '/official/user-id/' }, "Investment")
						),
						td(
							{ class: 'actions' },
							a(span({ class: 'fa fa-download' }, "Download"))
						)
					),
					tr(
						td(
							{ class: 'submitted-user-data-table-basic' },
							a({ href: '/official/user-id/' }, "John Watson",
								span('johnwatson@gmail.com')
								)
						),
						td(
							{ class: 'desktop-only' },
							a({ href: '/official/user-id/' }, "4068-50001-N-2013")
						),
						td(
							{ class: 'desktop-only' },
							a({ href: '/official/user-id/' }, "23/07/2014 18:09:22")
						),
						td(
							a({ href: '/official/user-id/' }, "Investment")
						),
						td(
							{ class: 'actions' },
							a(span({ class: 'fa fa-download' }, "Download"))
						)
					),
					tr(
						td(
							{ class: 'submitted-user-data-table-basic' },
							a({ href: '/official/user-id/' }, "John Watson",
								span('johnwatson@gmail.com')
								)
						),
						td(
							{ class: 'desktop-only' },
							a({ href: '/official/user-id/' }, "4068-50001-N-2013")
						),
						td(
							{ class: 'desktop-only' },
							a({ href: '/official/user-id/' }, "23/07/2014 18:09:22")
						),
						td(
							a({ href: '/official/user-id/' }, "Investment")
						),
						td(
							{ class: 'actions' },
							a(span({ class: 'fa fa-download' }, "Download"))
						)
					),
					tr(
						td(
							{ class: 'submitted-user-data-table-basic' },
							a({ href: '/official/user-id/' }, "John Watson",
								span('johnwatson@gmail.com')
								)
						),
						td(
							{ class: 'desktop-only' },
							a({ href: '/official/user-id/' }, "4068-50001-N-2013")
						),
						td(
							{ class: 'desktop-only' },
							a({ href: '/official/user-id/' }, "23/07/2014 18:09:22")
						),
						td(
							a({ href: '/official/user-id/' }, "Investment")
						),
						td(
							{ class: 'actions' },
							a(span({ class: 'fa fa-download' }, "Download"))
						)
					),
					tr(
						td(
							{ class: 'submitted-user-data-table-basic' },
							a({ href: '/official/user-id/' }, "John Watson",
								span('johnwatson@gmail.com')
								)
						),
						td(
							{ class: 'desktop-only' },
							a({ href: '/official/user-id/' }, "4068-50001-N-2013")
						),
						td(
							{ class: 'desktop-only' },
							a({ href: '/official/user-id/' }, "23/07/2014 18:09:22")
						),
						td(
							a({ href: '/official/user-id/' }, "Investment")
						),
						td(
							{ class: 'actions' },
							a(span({ class: 'fa fa-download' }, "Download"))
						)
					)
				)
			)
		),

		ul(
			{ class: 'pagination' },
			li(a("<<")),
			li(a("<")),
			li({ class: 'pagination-active' }, a("1")),
			li(a("2")),
			li(a("3")),
			li(a("4")),
			li(a("5")),
			li(a("6")),
			li(a("7")),
			li(a("8")),
			li(a("9")),
			li(a("10")),
			li(a("11")),
			li(a("12")),
			li(a("13")),
			li(a("14")),
			li(a("15")),
			li(a("16")),
			li(a(">")),
			li(a(">>"))
		)];
};
