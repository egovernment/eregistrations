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
  , dateFromToBlock    = require('./components/filter-bar/select-date-range-safe-fallback')
  , oToArray           = require('es5-ext/object/to-array')
  , getStepLabelByShortPath = require('../utils/get-step-label-by-short-path')
  , getDynamicUrl           = require('./utils/get-dynamic-url')
  , initTableSortingOnClient = require('./utils/init-table-sorting-on-client');

exports._parent        = require('./statistics-files');
exports._customFilters = Function.prototype;

exports['files-nav']             = { class: { 'submitted-menu-item-active': true } };
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
	var queryHandler, data = new ObservableValue({})
	  , pagination = new Pagination('/files/by-operator/'), params;

	queryHandler = setupQueryHandler(queryHandlerConf,
		location, '/files/by-operator/');

	params = queryHandler._handlers.map(function (handler) {
		return handler.name;
	});

	queryHandler.on('query', function (query) {
		var serverQuery = copy(query), dateFrom, dateTo;

		dateFrom = query.dateFrom;
		dateTo   = query.dateTo || new db.Date();

		serverQuery.dateFrom = dateFrom.toJSON();
		serverQuery.dateTo = dateTo.toJSON();
		// hard code for tests

		queryServer(serverQuery).done(function (responseData) {
			data.value = responseData.data;

			pagination.current.value = Number(serverQuery.page);
			pagination.count.value   = responseData.pageCount;
		});
	});

	div({ class: 'block-pull-up' },
		form({ action: '/files/by-operator/', autoSubmit: true },
			section({ class: 'date-period-selector-positioned-on-submenu' }, dateFromToBlock()),
			section({ class: 'section-primary users-table-filter-bar display-flex flex-wrap' },
				div(
					div({ class: 'width-30 users-table-filter-bar-status' },
						selectService({ label: _("All services") })),
					div({ class: 'width-30 users-table-filter-bar-status' },
						selectCertificate(),
						legacy('selectMatch', 'service-select', serviceToCertLegacyMatch)),
					div({ class: 'width-30 users-table-filter-bar-status' },
						selectUser({ label: _("All operators"), name: 'processor' }))
				),
				div({ class: 'width-27-5 users-table-filter-bar-status' },
					select(
						{ id: 'select-step', name: 'step' },
						list(Object.keys(processingSteps), function (step) {
							return option({
								value: step,
								selected: location.query.get('step').map(function (value) {
									var selected = (step ? (value === step) : (value == null));
									return selected ? 'selected' : null;
								})
							}, getStepLabelByShortPath(step));
						})
					)),
				selectPeriodMode(),
				div(
					div(
						a({
							class: 'users-table-filter-bar-print',
							href: getDynamicUrl('/flow-roles-operators-data.pdf', { only: params }),
							target: '_blank'
						}, span({ class: 'fa fa-print' }), " ", _("Print pdf"))
					),
					div(
						a({
							class: 'users-table-filter-bar-print',
							href: getDynamicUrl('/flow-roles-operators-data.csv', { only: params }),
							target: '_blank'
						}, span({ class: 'fa fa-print' }), " ", _("Print csv"))
					)
				),
				p({ class: 'submit' }, input({ type: 'submit' }))),
			section({ class: 'pad-if-pagination' }, pagination),
			br(),
			data.map(function (result) {
				var step = location.query.step || Object.keys(processingSteps)[0];
				var mode = modes.get(location.query.mode || 'daily'), container, currentTable;

				container = section({ class: "section-primary" },
					h3(getStepLabelByShortPath(step)),
					currentTable = table({ class: 'statistics-table' },
						thead(tr(
							th({ class: 'statistics-table-number fixed-first-cell' }, mode.labelNoun),
							th({ class: 'statistics-table-number' }, _("Operator")),
							th({ class: 'statistics-table-number' }, _("Files Processed")),
							th({ class: 'statistics-table-number' }, _("Validated")),
							th({ class: 'statistics-table-number' }, _("Sent Back for corrections")),
							th({ class: 'statistics-table-number' }, _("Rejected"))
						)),
						tbody(Object.keys(result).length ?
								oToArray(result, function (dateResult, date) {
									return oToArray(dateResult, function (processorResult, processorId) {
										return tr(
											td({ class: 'statistics-table-number' }, date),
											td({ class: 'statistics-table-number' },
												db.User.getById(processorId) || _('Unknown user')),
											oToArray(processorResult, function (data, key) {
												return td({ class: 'statistics-table-number' }, data);
											})
										);
									});
								}) : tr(td({ class: 'empty statistics-table-info', colspan: 6 },
								_("No data for this criteria"))))));
				initTableSortingOnClient(currentTable);
				return container;
			})));
};
