'use strict';

var db                = require('../db')
  , _                 = require('mano').i18n.bind('View: Official: Inspector')
  , location          = require('mano/lib/client/location')
  , capitalize        = require('es5-ext/string/#/capitalize')
  , once              = require('timers-ext/once')
  , dispatch          = require('dom-ext/html-element/#/dispatch-event-2')
  , env               = require('mano').env

  , tableColumns      = require('./components/inspector-table-columns')
  , getInspectorTable = require('./components/inspector-table')
  , selectService     = require('./components/filter-bar/select-service');

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		var statusQuery        = location.query.get('status')
		  , serviceQuery       = location.query.get('service')
		  , registrationQuery  = location.query.get('registration')
		  , submitterTypeQuery = location.query.get('submitterType')
		  , SubmitterType      = db.BusinessProcess.prototype.getDescriptor('submitterType').type
		  , searchForm, searchInput, inspectorTable;

		section(
			{ class: 'section-primary users-table-filter-bar users-table-filter-bar-inspector' },
			searchForm = form(
				{ action: '/', autoSubmit: true },
				exports._customFilters.call(this),
				// Business process status selector
				div(
					{ class: 'users-table-filter-bar-status' },
					label({ for: 'status-select' }, _("Status"), ':'),
					select(
						{ id: 'status-select', name: 'status' },
						option({ value: '', selected: statusQuery.map(function (value) {
							return value ? null : 'selected';
						}) }, _("All")),
						list(db.BusinessProcessStatus.members, function (businessProcessStatus) {
							return option({
								value: businessProcessStatus,
								selected: statusQuery.map(function (value) {
									var selected = (businessProcessStatus ?
											(value === businessProcessStatus) : (value == null));
									return selected ? 'selected' : null;
								})
							}, db.BusinessProcessStatus.meta[businessProcessStatus].label);
						})
					)
				),
				// Business process type selector
				div(
					{ class: 'users-table-filter-bar-status' },
					label({ for: 'service-select' }, _("Service"), ':'),
					selectService()
				),
				// Registration selector
				div(
					{ class: 'users-table-filter-bar-status' },
					label({ for: 'registration-select' }, _("Inscription"), ':'),
					select(
						{ id: 'registration-select', name: 'registration' },
						option({ value: '', selected: registrationQuery.map(function (value) {
							return value ? null : 'selected';
						}) }, _("All")),
						serviceQuery.map(function (service) {
							var drawnRegistrations = [];

							if (service) {
								service = db['BusinessProcess' + capitalize.call(service)];
							}

							var drawRegistrations = function (registrations) {
								return list(registrations, function (registration, registrationName) {
									if (drawnRegistrations[registrationName]) return;
									drawnRegistrations[registrationName] = true;

									return option({
										value: registrationName,
										selected: registrationQuery.map(function (value) {
											var selected = registrationName ?
													(value === registrationName) : (value == null);
											return selected ? 'selected' : null;
										})
									}, registration.label);
								});
							};

							if (service) {
								return drawRegistrations(service.prototype.registrations.map);
							}

							return list(db.BusinessProcess.extensions, function (ServiceType) {
								return drawRegistrations(ServiceType.prototype.registrations.map);
							});
						})
					)
				),
				// Submitter type selector
				div(
					{ class: 'users-table-filter-bar-status' },
					label({ for: 'submitter-type-select' }, _("User type"), ':'),
					select(
						{ id: 'submitter-type-select', name: 'submitterType' },
						option({ value: '', selected: submitterTypeQuery.map(function (value) {
							return value ? null : 'selected';
						}) }, _("All")),
						list(SubmitterType.members, function (submitterType) {
							return option({
								value: submitterType,
								selected: submitterTypeQuery.map(function (value) {
									var selected = (submitterType ? (value === submitterType) : (value == null));
									return selected ? 'selected' : null;
								})
							}, SubmitterType.meta[submitterType].label);
						})
					)
				),
				// Search input
				div(
					{ class: 'users-table-filter-bar-search' },
					label({ for: 'search-input' }, _("Search")),
					span({ class: 'input-append' },
						searchInput = input({ id: 'search-input', name: 'search', type: 'search',
							value: location.query.get('search') }),
						span({ class: 'add-on' }, span({ class: 'fa fa-search' })))
				),
				// Submit button
				p({ class: 'submit' }, input({ type: 'submit' }))
			),
			exports._customAfterFilters.call(this)
		);

		searchInput.oninput = once(function () { dispatch.call(searchForm, 'submit'); }, 300);

		insert(inspectorTable = getInspectorTable({
			columns: tableColumns,
			getOrderIndex: exports._getOrderIndex,
			itemsPerPage: env.objectsListItemsPerPage,
			class: 'submitted-user-data-table'
		}));

		insert(inspectorTable.pagination,
			section({ class: 'table-responsive-container' }, inspectorTable),
			inspectorTable.pagination);
	}
};

exports._customFilters = Function.prototype;

exports._customAfterFilters = Function.prototype;

exports._getOrderIndex = function (businessProcess) {
	return businessProcess.lastModified;
};
