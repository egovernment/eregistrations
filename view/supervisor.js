'use strict';

var _                  = require('mano').i18n.bind('View: Supervisor')
  , toArray            = require('es5-ext/object/to-array')
  , byOrder            = function (a, b) { return this[a].order - this[b].order; }
  , once               = require('timers-ext/once')
  , dispatch           = require('dom-ext/html-element/#/dispatch-event-2')
  , location           = require('mano/lib/client/location')
  , timeRanges         = require('../utils/supervisor-time-ranges')
  , statuses           = require('../utils/supervisor-statuses-list')
  , statusMeta         = require('mano').db.ProcessingStepStatus.meta
  , assign             = require('es5-ext/object/assign')
  , stepsMap           = assign(require('../utils/processing-steps-map'))
  , getSupervisorTable = require('eregistrations/view/components/supervisor-table')
  , from               = require('es5-ext/array/from')
  , tableColumns       = require('eregistrations/view/_supervisor-table-columns.js')
  , columns            = from(tableColumns.columns)
  , env                = require('mano').env;

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		var searchForm, searchInput, supervisorTable;

		section({ class: 'section-primary users-table-filter-bar' },
			searchForm = form({ action: '/', autoSubmit: true },
				div({ class: 'users-table-filter-bar-status' },
					label({ for: 'state-select' }, _("Role"), ":"),
					select({ id: 'state-select', name: 'step' },
						option({ value: '', selected:
								location.query.get('step').map(function (value) {
								return value ? null : 'selected';
							}) },
							_("All")),
						toArray(stepsMap, function (data, name) {
							return option({ value: name, selected:
									location.query.get('step').map(function (value) {
									return value === name ? 'selected' : null;
								}) },
								data.label);
						}, null, byOrder))),
				div(
					label({ for: 'status-select' }, _("Status"), ":"),
					select({ id: 'status-select', name: 'status' },
						list(statuses, function (status) {
							return option({
								value: status,
								selected: location.query.get('status').map(function (name) {
									return status === name ? 'selected' : null;
								})
							}, statusMeta[status].label);
						}))
				),
				div(
					label({ for: 'time-select' }, _("Time"), ":"),
					select({ id: 'time-select', name: 'time' },
						list(timeRanges, function (data) {
							return option({ value: data.name || '', selected:
									location.query.get('time').map(function (name) {
									var selected = (data.name ? (data.name === name) : (name == null));
									return selected ? 'selected' : null;
								}) },
									data.label);
						}))
				),
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
				a({ href: mmap(location.query.get('step'), function (step) {
					return mmap(location.query.get('time'), function (time) {
						return mmap(location.query.get('page'), function (page) {
							var search = [];
								if (step) search.push('step=' + step);
								if (time) search.push('time=' + time);
								if (page) search.push('page=' + page);
								if (search.length) search = '?' + search.join('&');
								else search = null;
							return url('print-supervisor-list', search);
						});
					});
				}), class: 'users-table-filter-bar-print', target: '_blank' },
					span({ class: 'fa fa-print' },
						_("Print list of requests")), _("Print the list"))
			));

		searchInput.oninput = once(function () { dispatch.call(searchForm, 'submit'); }, 300);

		supervisorTable = getSupervisorTable({
			user: this.user,
			stepsMap: stepsMap,
			itemsPerPage: env.objectsListItemsPerPage,
			columns: columns,
			class: 'submitted-user-data-table'
		});

		insert(supervisorTable.pagination,
			section({ class: 'table-responsive-container' }, supervisorTable),
			supervisorTable.pagination);
	}
};
