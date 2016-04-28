'use strict';

var db                        = require('mano').db
  , _                         = require('mano').i18n.bind('View: Dispatcher')
  , env                       = require('mano').env
  , from                      = require('es5-ext/array/from')
  , getBusinessProcessesTable = require('./components/business-processes-table')
  , tableColumns              = require('./_business-process-table-columns')
  , columns                   = from(tableColumns.columns)
  , once                      = require('timers-ext/once')
  , dispatch                  = require('dom-ext/html-element/#/dispatch-event-2')
  , location                  = require('mano/lib/client/location');

exports._parent = require('./dispatcher-base');
exports._match  = 'processingStep';
exports._customFilter = function (processingStep, assignableUsers) {
	return assignableUsers;
};

columns.push(tableColumns.archiverColumn);
columns.push(tableColumns.goToColumn);

var assignmentColumn = {
	head: _("Assignee"),
	data: function (processingStep, assignableUsers) {
		return form({ method: 'post',
				action: url('assign-business-process'), class: 'submitted-menu-role-select',
				id: 'form-current-role', autoSubmit: true },
			p(input({ id: 'assignee-select',
				dbjs: processingStep._assignee, list:
					exports._customFilter(processingStep, assignableUsers) })),
			p({ class: 'submit' }, input({ type: 'submit' })));
	}
};
var assignmentColumnData = assignmentColumn.data;
columns.push(assignmentColumn);

var businessProcessTable = function (context) {
	var assignableUsers = db.User.instances.filterByKey('roles', function (roles) {
		return roles.has(context.roleName);
	});
	columns[columns.length - 1].data = function (businessProcess) {
		return assignmentColumnData(businessProcess.processingSteps.map[context.shortRoleName],
			assignableUsers);
	};

	return getBusinessProcessesTable({
		user: context.user,
		roleName: context.shortRoleName,
		fullItemsRoleName: 'dispatcher',
		statusMap: context.statusMap,
		getOrderIndex: context.getOrderIndex,
		itemsPerPage: env.objectsListItemsPerPage,
		columns: columns,
		tableUrl: location.pathname,
		class: 'submitted-user-data-table'
	});
};

exports['dispatcher-main'] = {
	content: function () {
		var searchForm, searchInput, businessProcessesTable;

		section({ class: 'section-primary users-table-filter-bar' },
			searchForm = form({ action: location.pathname, autoSubmit: true },
				div(
					label({ for: 'search-input' }, _("Search")),
					span({ class: 'input-append' },
						searchInput = input({ id: 'search-input', name: 'search', type: 'search',
							value: location.query.get('search') }),
						span({ class: 'add-on' }, span({ class: 'fa fa-search' })))
				),
				div(
					input({ type: 'submit', value: _("Search") })
				)));

		searchInput.oninput = once(function () { dispatch.call(searchForm, 'submit'); }, 300);

		businessProcessesTable = businessProcessTable(this);

		insert(businessProcessesTable.pagination,
			section({ class: 'table-responsive-container' }, businessProcessesTable),
			businessProcessesTable.pagination);
	}
};
