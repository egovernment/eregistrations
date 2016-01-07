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
		var searchForm, searchInput, businessProcessesTable;

		section({ class: 'section-primary users-table-filter-bar' },
			searchForm = form({ action: '/', autoSubmit: true },
				div({ class: 'users-table-filter-bar-status' },
					label({ for: 'state-select' }, _("Status"), ":"),
					select({ id: 'state-select', name: 'status' },
						toArray(exports._statusMap(this), function (data, name) {
							return option({ value: name, selected:
								location.query.get('status').map(function (value) {
									var selected = (name ? (value === name) : (value == null));
									return selected ? 'selected' : null;
								}) },
								data.label);
						}, null, byOrder))),
				div(
					label({ for: 'search-input' }, _("Search")),
					span({ class: 'input-append' },
						searchInput = input({ id: 'search-input', name: 'search', type: 'search',
							value: location.query.get('search') }),
						span({ class: 'add-on' }, span({ class: 'fa fa-search' })))
				),
				div(
					input({ type: 'submit', class: 'button-search', value: _("Search") })
				)),
			div(
				a({ href: mmap(location.query.get('status'), function (status) {
					return mmap(location.query.get('page'), function (page) {
						var search = [];
						if (status) search.push('status=' + status);
						if (page) search.push('page=' + page);
						if (search.length) search = '?' + search.join('&');
						else search = null;
						return url('print-business-processes-list', search);
					});
				}), class: 'users-table-filter-bar-print', target: '_blank' },
					span({ class: 'fa fa-print' },
						_("Print list of requests")), _("Print the list")
					)
			)
			);

		searchInput.oninput = once(function () { dispatch.call(searchForm, 'submit'); }, 300);

		businessProcessesTable = exports._businessProcessTable(this);

		insert(businessProcessesTable.pagination,
			section({ class: 'table-responsive-container' }, businessProcessesTable),
			businessProcessesTable.pagination);
	}
};

exports._statusMap = Function.prototype;
exports._businessProcessTable = Function.prototype;
