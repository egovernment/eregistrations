'use strict';

var db                = require('../db')
  , _                 = require('mano').i18n.bind('View: Official: Inspector')
  , location          = require('mano/lib/client/location')
  , setupQueryHandler = require('../utils/setup-client-query-handler')
  , getData           = require('mano/lib/client/xhr-driver').get
  , memoize           = require('memoizee')
  , capitalize        = require('es5-ext/string/#/capitalize')
  , uncapitalize      = require('es5-ext/string/#/uncapitalize')
  , ObservableValue   = require('observable-value')
  , once              = require('timers-ext/once')
  , dispatch          = require('dom-ext/html-element/#/dispatch-event-2')

  , queryHandlerConf  = require('../apps/inspector/query-conf')
  , tableColumns      = require('./components/inspector-table-columns');

var queryServer = memoize(function (query) {
	return getData('/get-data/', query);
}, {
	normalizer: function (args) { return JSON.stringify(args[0]); }
});

exports._parent = require('./abstract-user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		var statusQuery        = location.query.get('status')
		  , serviceQuery       = location.query.get('service')
		  , registrationQuery   = location.query.get('registration')
		  , submitterTypeQuery = location.query.get('submitterType')
		  , SubmitterType      = db.BusinessProcess.prototype.getDescriptor('submitterType').type
		  , searchForm, searchInput;

		var bpData       = new ObservableValue()
		  , queryHandler = setupQueryHandler(queryHandlerConf, location, '/');

		queryHandler.on('query', function (query) {
			if (query.dateFrom) {
				query.dateFrom = query.dateFrom.toJSON();
			}
			if (query.dateTo) {
				query.dateTo = query.dateTo.toJSON();
			}
			queryServer(query).done(function (queryResult) {
				bpData.value = queryResult;
			});
		});

		section(
			{ class: 'section-primary users-table-filter-bar' },
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
					select(
						{ id: 'service-select', name: 'service' },
						option({ value: '', selected: serviceQuery.map(function (value) {
							return value ? null : 'selected';
						}) }, _("All")),
						list(db.BusinessProcess.extensions, function (ServiceType) {
							var serviceName = uncapitalize.call(
								ServiceType.__id__.slice('BusinessProcess'.length)
							);

							return option({
								value: serviceName,
								selected: serviceQuery.map(function (value) {
									var selected = (serviceName ? (value === serviceName) : (value == null));
									return selected ? 'selected' : null;
								})
							}, ServiceType.prototype.label);
						})
					)
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
							var drawnCertificates = [];

							if (service) {
								service = db['BusinessProcess' + capitalize.call(service)];
							}

							var drawCertificates = function (certificates) {
								return list(certificates, function (certificate, certificateName) {
									if (drawnCertificates[certificateName]) return;
									drawnCertificates[certificateName] = true;

									return option({
										value: certificateName,
										selected: registrationQuery.map(function (value) {
											var selected = certificateName ?
													(value === certificateName) : (value == null);
											return selected ? 'selected' : null;
										})
									}, certificate.label);
								});
							};

							if (service) {
								return drawCertificates(service.prototype.certificates.map);
							}

							return list(db.BusinessProcess.extensions, function (ServiceType) {
								return drawCertificates(ServiceType.prototype.certificates.map);
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
					label({ for: 'search-input' }, _("Search")),
					span({ class: 'input-append' },
						searchInput = input({ id: 'search-input', name: 'search', type: 'search',
							value: location.query.get('search') }),
						span({ class: 'add-on' }, span({ class: 'fa fa-search' })))
				),
				// Submit button
				p({ class: 'submit' }, input({ type: 'submit' }))
			)
		);

		searchInput.oninput = once(function () { dispatch.call(searchForm, 'submit'); }, 300);

		table({
			class: 'submitted-user-data-table',
			configuration: {
				collection: bpData,
				columns: tableColumns.columns
			}
			// Important: this needs to be after configuration directive
			// responsive: true
		});
	}
};

exports._customFilters = Function.prototype;
exports._statusMap = Function.prototype;
