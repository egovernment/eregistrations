'use strict';

var _                 = require('mano').i18n.bind('View: Statistics')
  , db                = require('../db')
  , uncapitalize      = require('es5-ext/string/#/uncapitalize')
  , location          = require('mano/lib/client/location')
  , queryHandlerConf  = require('../apps/statistics/flow-query-operators-conf')
  , setupQueryHandler = require('../utils/setup-client-query-handler')
  , copy              = require('es5-ext/object/copy')
  , ObservableValue   = require('observable-value')
  , Pagination        = require('./components/pagination')
  , modes             = require('../utils/statistics-flow-group-modes')
  , selectService     = require('./components/filter-bar/select-service')
  , selectCertificate = require('./components/filter-bar/select-certificate')
  , selectPeriodMode  = require('./components/filter-bar/select-period-mode')
  , selectUser        = require('./components/filter-bar/select-user')
  , processingSteps   = require('../processing-steps-meta')
  , queryServer       = require('./utils/statistics-flow-operators-query-server')
  , getStepLabelByShortPath = require('../utils/get-step-label-by-short-path')
  , isOfficialRoleName      = require('../utils/is-official-role-name')
  , usersCollection         = db.User.instances.filterByKey('roles', function (roles) {
	return roles.some(isOfficialRoleName);
});

exports._parent        = require('./statistics-flow');
exports._customFilters = Function.prototype;

exports['flow-nav']             = { class: { 'submitted-menu-item-active': true } };
exports['flow-by-operator-nav'] = { class: { 'pills-nav-active': true } };

var serviceToCertLegacyMatch = { '': [] };

var getServiceName = function (ServiceType) {
	return uncapitalize.call(
		ServiceType.__id__.slice('BusinessProcess'.length)
	);
};

db.BusinessProcess.extensions.forEach(function (ServiceType) {
	ServiceType.prototype.certificates.map.forEach(function (certificate) {
		if (!serviceToCertLegacyMatch[getServiceName(ServiceType)]) {
			serviceToCertLegacyMatch[getServiceName(ServiceType)] = [];
		}
		serviceToCertLegacyMatch[getServiceName(ServiceType)].push('certificate-' + certificate.key);
		serviceToCertLegacyMatch[''].push('certificate-' + certificate.key);
	});
});

exports['statistics-main'] = function () {
	var queryHandler, tables = new ObservableValue({})
	  , pagination = new Pagination('/flow/by-operator/'), tablesValue = {};

	Object.keys(processingSteps).forEach(function (stepShortPath) {
		tablesValue[stepShortPath] = new ObservableValue({});
	});

	tables.value = tablesValue;

	queryHandler = setupQueryHandler(queryHandlerConf,
		location, '/flow/by-operator/');

	queryHandler.on('query', function (query) {
		var serverQuery = copy(query), dateFrom, dateTo;

		dateFrom = query.dateFrom;
		dateTo   = query.dateTo || new db.Date();

		serverQuery.dateFrom = dateFrom.toJSON();
		serverQuery.dateTo = dateTo.toJSON();
		// hard code for tests

		queryServer(serverQuery).done(function (responseData) {
			tables.value[query.step].value = responseData;

			pagination.count.value   = query.pageCount;
			pagination.current.value = query.page;
		});
	});

	section({ class: 'section-primary users-table-filter-bar' },
		form({ action: '/flow/by-operator/', autoSubmit: true },
			div({ class: 'users-table-filter-bar-status' },
				selectService({ label: _("All services") })),
			div({ class: 'users-table-filter-bar-status' },
				selectCertificate(),
				legacy('selectMatch', 'service-select', serviceToCertLegacyMatch)),
			div({ class: 'users-table-filter-bar-status' },
				selectUser({ label: _("All operators"), name: 'processor',
					usersCollection: usersCollection })),
			div(
				{ class: 'users-table-filter-bar-status' },
				label({ for: 'date-from-input' }, _("Date from"), ":"),
				input({ id: 'date-from-input', type: 'date',
					name: 'dateFrom', value: location.query.get('dateFrom').map(function (dateFrom) {
					var now = new db.Date(), defaultDate;
					defaultDate = new db.Date(now.getUTCFullYear(), now.getUTCMonth(),
								now.getUTCDate() - 6);

					return dateFrom || defaultDate;
				}) })
			),
			div(
				{ class: 'users-table-filter-bar-status' },
				label({ for: 'date-to-input' }, _("Date to"), ":"),
				input({ id: 'date-to-input', type: 'date',
					name: 'dateTo', value: location.query.get('dateTo') })
			),
			selectPeriodMode(),
			p({ class: 'submit' }, input({ type: 'submit' }))));

	section(pagination);
	section({ class: "section-primary" },
		list(Object.keys(tables.value), function (key) {
			return tables.value[key].map(function (result) {
				if (!result || !Object.keys(result).length) return;
				var mode = modes.get(location.query.mode || 'daily');
				return section({ class: "section-primary" },
					h3(getStepLabelByShortPath(key)),
					table({ class: 'statistics-table' },
						thead(
							th({ class: 'statistics-table-number' }, mode.labelNoun),
							th({ class: 'statistics-table-number' }, _("Operator")),
							th({ class: 'statistics-table-number' }, _("Files Processed")),
							th({ class: 'statistics-table-number' }, _("Validated")),
							th({ class: 'statistics-table-number' }, _("Sent Back for corrections")),
							th({ class: 'statistics-table-number' }, _("Rejected"))
						),
						tbody({ onEmpty: tr(td({ class: 'empty', colspan: 6 },
							_("No data for this criteria"))) }, Object.keys(result).map(function (date) {
							return Object.keys(result[date]).map(function (processorId) {
								return tr(list(Object.keys(result[date][processorId]), function (prop) {
									return td({ class: 'statistics-table-number' }, result[date][processorId][prop]);
								}));
							});
						}))));
			});
		}));
};
