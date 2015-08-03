'use strict';

var _  = require('mano').i18n.bind('User Offcial')
, toArray       = require('es5-ext/object/to-array')
, byOrder = function (a, b) { return this[a].order - this[b].order; }
, once          = require('timers-ext/once')
, dispatch      = require('dom-ext/html-element/#/dispatch-event-2')
, location     = require('mano/lib/client/location');

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		var searchForm, searchInput, rootUrl = url();

		section({ class: 'section-primary users-table-filter-bar' },
			searchForm = form({ action: rootUrl, autoSubmit: true },
				div({ class: 'users-table-filter-bar-status' },
					label({ for: 'state-select' }, _("Status"), ":"),
					select({ id: 'state-select', name: 'estado' },
						toArray(exports._statusMap(this), function (data, name) {
							return option({ value: name, selected:
								location.query.get('estado').map(function (value) {
									var selected = (name ? (value === name) : (value == null));
									return selected ? 'selected' : null;
								}) },
								data.label);
						}, null, byOrder))),
				div(
					label({ for: 'search-input' }, _("Search")),
					span({ class: 'input-append' },
						searchInput = input({ id: 'search-input', name: 'buscar', type: 'search',
							value: location.query.get('buscar') }),
						span({ class: 'add-on' }, span({ class: 'fa fa-search' })))
				),
				div(
					input({ type: 'submit', value: _("Search") })
				)),
			div(
				a({ href: mmap(location.query.get('estado'), function (status) {
					return mmap(location.query.get('page'), function (page) {
						var search = [];
						if (status) search.push('estado=' + status);
						if (page) search.push('page=' + page);
						if (search.length) search = '?' + search.join('&');
						else search = null;
						return url('imprimir', search);
					});
				}), class: 'users-table-filter-bar-print', target: '_blank' },
					span({ class: 'fa fa-print' },
						_("Print list of requests")), _("Print the list")
					)
			)
			);

		searchInput.oninput = once(function () { dispatch.call(searchForm, 'submit'); }, 300);

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
		);

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
		);

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
		);
	}
};

exports._statusMap = Function.prototype;
exports._usersTable = Function.prototype;
