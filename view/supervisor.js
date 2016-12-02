'use strict';

var _                  = require('mano').i18n.bind('View: Official: Supervisor')
  , toArray            = require('es5-ext/object/to-array')
  , from               = require('es5-ext/array/from')
  , once               = require('timers-ext/once')
  , dispatch           = require('dom-ext/html-element/#/dispatch-event-2')
  , location           = require('mano/lib/client/location')
  , getSupervisorTable = require('./components/supervisor-table')
  , tableColumns       = require('./components/supervisor-table-columns')
  , timeRanges         = require('../utils/supervisor-time-ranges')
  , filterStepsMap     = require('../utils/filter-supervisor-steps-map')
  , statusMeta         = require('mano').db.ProcessingStepStatus.meta
  , stepLabelsMap      = require('../utils/processing-steps-label-map')
  , columns            = from(tableColumns.columns)
  , env                = require('mano').env;

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		var stepsMap    = exports._statusMap(this)
		  , stepQuery   = location.query.get('step')
		  , statusQuery = location.query.get('status')
		  , timeQuery   = location.query.get('time')

		  , searchForm, searchInput, supervisorTable;

		// this should not happen, but it might if we don't block illegal role dependencies
		if (!stepsMap) return;

		stepsMap = filterStepsMap(stepsMap);

		section({ class: 'section-primary users-table-filter-bar' },
			searchForm = form({ action: '/', autoSubmit: true },
				div({ class: 'users-table-filter-bar-status' },
					label({ for: 'state-select' }, _("Role"), ":"),
					select({ id: 'state-select', name: 'step' },
						option({ value: '', selected: stepQuery.map(function (value) {
							return value ? null : 'selected';
						}) }, _("All")),
						toArray(stepsMap, function (statuses, name) {
							return option({
								value: name,
								selected: stepQuery.map(function (value) {
									return value === name ? 'selected' : null;
								})
							}, stepLabelsMap[name]);
						}))),
				mmap(stepQuery, function (selectedStep) {
					var statuses;

					if (!selectedStep) return;

					statuses = Object.keys(stepsMap[selectedStep]);
					if (statuses.length < 2) return;

					return statusQuery.map(function (selectedStatus) {
						if (selectedStatus && !stepsMap[selectedStep][selectedStatus]) return;

						return div(
							label({ for: 'status-select' }, _("Status"), ":"),
							select(
								{ id: 'status-select', name: 'status' },
								list(statuses, function (status) {
									return option({
										value: status === 'pending' ? '' : status,
										selected: status === selectedStatus ? 'selected' : null
									}, statusMeta[status].label);
								})
							)
						);
					});
				}),
				div(
					label({ for: 'time-select' }, _("Time"), ":"),
					select({ id: 'time-select', name: 'time' },
						list(timeRanges, function (data) {
							return option({ value: data.name || '', selected:
								timeQuery.map(function (name) {
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
				a({ href: mmap(stepQuery, function (step) {
					return mmap(timeQuery, function (time) {
						return mmap(location.query.get('page'), function (page) {
							var search = [];
								if (step) search.push('step=' + step);
								if (time) search.push('time=' + time);
								if (page) search.push('page=' + page);
								if (search.length) search = '?' + search.join('&');
								else search = null;
							return url('print-business-processes-list', search);
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

exports._statusMap = Function.prototype;
