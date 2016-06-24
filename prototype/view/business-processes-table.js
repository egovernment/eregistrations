'use strict';

var  _      = require('mano').i18n.bind('Official: Revision')
  , all     = require('eregistrations/business-processes').filterByKey('isRevisionReady', true)
	.filterByKey('isApplicationResolved', false)
  , memoize = require('memoizee/plain');

module.exports = exports = require('../../view/business-processes-table');

exports['submitted-menu'] = function () {
	li({ class: 'submitted-menu-item-active' }, a("Official"));
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

exports._businessProcessTable = function () {
	return table(
		{ class: 'submitted-user-data-table' },
		thead(
			tr(
				th(_("Entity")),
				th({ class: 'actions' }, _("Service")),
				th({ class: 'actions' }, _("Submission date")),
				th(_("Withdraw date")),
				th({ class: 'actions' }, _("Inscriptions and controls")),
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
					{ class: 'desktop-only' },
					a({ href: '/official/user-id/' }, "23/07/2014 19:09:22")
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
					{ class: 'desktop-only' },
					a({ href: '/official/user-id/' }, "23/07/2014 19:09:22")
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
					{ class: 'desktop-only' },
					a({ href: '/official/user-id/' }, "23/07/2014 19:09:22")
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
					{ class: 'desktop-only' },
					a({ href: '/official/user-id/' }, "23/07/2014 19:09:22")
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
					{ class: 'desktop-only' },
					a({ href: '/official/user-id/' }, "23/07/2014 19:09:22")
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
					{ class: 'desktop-only' },
					a({ href: '/official/user-id/' }, "23/07/2014 19:09:22")
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
					{ class: 'desktop-only' },
					a({ href: '/official/user-id/' }, "23/07/2014 19:09:22")
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
					{ class: 'desktop-only' },
					a({ href: '/official/user-id/' }, "23/07/2014 19:09:22")
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
					{ class: 'desktop-only' },
					a({ href: '/official/user-id/' }, "23/07/2014 19:09:22")
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
	);
};
