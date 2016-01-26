'use strict';

var _        = require('mano').i18n.bind('View: Supervisor')
  , toArray       = require('es5-ext/object/to-array')
  , byOrder = function (a, b) { return this[a].order - this[b].order; }
  , once     = require('timers-ext/once')
  , dispatch = require('dom-ext/html-element/#/dispatch-event-2')
  , location = require('mano/lib/client/location')
  , timeRanges = require('../utils/supervisor-time-ranges');

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		var searchForm, searchInput, processingStepsTable;

		section({ class: 'section-primary users-table-filter-bar' },
			searchForm = form({ action: '/', autoSubmit: true },
				div({ class: 'users-table-filter-bar-status' },
					label({ for: 'state-select' }, _("Status"), ":"),
					select({ id: 'state-select', name: 'status' },
						toArray(exports._statusMap(this), function (data, name) {
							return option({ value: name,
									selected: location.query.get('status').map(function (value) {
									var selected = (name ? (value === name) : (value == null));
									return selected ? 'selected' : null;
								}) },
								data.label);
						}, null, byOrder))),
				div({ class: 'users-table-filter-bar-status' },
					label({ for: 'time-select' }, _("Time"), ":"),
					select({ id: 'time-select', name: 'time' },
						list(timeRanges, function (data) {
							return option({ value: data.token,
									selected: location.query.get('time').map(function (token) {
									return data.token === token ? 'selected' : null;
								}) },
								data.label);
						}))),
				div(
					label({ for: 'search-input' }, _("Search")),
					span({ class: 'input-append' },
						searchInput = input({ id: 'search-input', name: 'search', type: 'search',
							value: location.query.get('search') }),
						span({ class: 'add-on' }, span({ class: 'fa fa-search' })))
				),
				div(
					input({ type: 'submit', value: _("Search") })
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
						_("Print list of requests")), _("Print the list"))
			));

		searchInput.oninput = once(function () { dispatch.call(searchForm, 'submit'); }, 300);

		processingStepsTable = exports._supervisorTable(this);

		insert(processingStepsTable.pagination,
			section({ class: 'table-responsive-container' }, processingStepsTable),
			processingStepsTable.pagination);
	}
};
