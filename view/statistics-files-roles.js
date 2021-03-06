'use strict';

var _                 = require('mano').i18n.bind('View: Statistics')
  , db                = require('../db')
  , uncapitalize      = require('es5-ext/string/#/uncapitalize')
  , location          = require('mano/lib/client/location')
  , queryHandlerConf  = require('../apps/statistics/flow-query-conf')
  , setupQueryHandler = require('../utils/setup-client-query-handler')
  , copy              = require('es5-ext/object/copy')
  , ObservableValue   = require('observable-value')
  , assign            = require('es5-ext/object/assign')
  , Pagination        = require('./components/pagination')
  , modes             = require('../utils/statistics-flow-group-modes')
  , selectService     = require('./components/filter-bar/select-service')
  , selectCertificate = require('./components/filter-bar/select-certificate')
  , selectPeriodMode  = require('./components/filter-bar/select-period-mode')
  , itemsPerPage      = require('../conf/objects-list-unlimited-items-per-page')
  , serviceQuery      = require('../apps-common/query-conf/service')
  , certificateQuery  = require('../apps-common/query-conf/certificate')
  , stepStatusQuery   = require('../apps-common/query-conf/processing-step-status')
  , copyDbDate        = require('../utils/copy-db-date')
  , queryServer       = require('./utils/statistics-flow-query-server')
  , processingSteps   = require('../processing-steps-meta')
  , getDynamicUrl     = require('./utils/get-dynamic-url')
  , getStepLabelByShortPath = require('../utils/get-step-label-by-short-path')
  , incrementDateByTimeUnit = require('../utils/increment-date-by-time-unit')
  , floorToTimeUnit         = require('../utils/floor-to-time-unit')
  , calculateDurationByMode = require('../utils/calculate-duration-by-mode')
  , dateFromToBlock         = require('./components/filter-bar/select-date-range-safe-fallback')
  , reduceResult            = require('../utils/statistics-flow-reduce-processing-step')
  , filterData              = require('../utils/statistics-flow-roles-filter-result')
  , initTableSortingOnClient = require('./utils/init-table-sorting-on-client');

exports._parent        = require('./statistics-files');
exports._customFilters = Function.prototype;

exports['files-nav']                = { class: { 'submitted-menu-item-active': true } };
exports['flow-by-role-nav'] = { class: { 'pills-nav-active': true } };

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

var stepStatuses = {};
['approved', 'sentBack', 'rejected', 'paused'].forEach(function (stepName) {
	// sanity check
	if (!db.ProcessingStepStatus.members.has(stepName)) {
		return;
	}
	stepStatuses[stepName] = db.ProcessingStepStatus.meta[stepName];
});

exports['statistics-main'] = function () {
	var queryHandler, data = new ObservableValue({})
	  , pagination = new Pagination('/files/by-role/'), handlerConf, params;

	handlerConf = queryHandlerConf.slice(0);
	handlerConf.push(serviceQuery, certificateQuery, stepStatusQuery);
	queryHandler = setupQueryHandler(handlerConf,
		location, '/files/by-role/');

	params = queryHandler._handlers.map(function (handler) {
		return handler.name;
	});

	queryHandler.on('query', function (query) {
		var serverQuery = copy(query), dateFrom, dateTo, mode
		  , currentDate, offset, timeUnitsCount = 0, durationInTimeUnits, page;
		dateFrom = query.dateFrom;
		dateTo   = query.dateTo || new db.Date();
		mode     = query.mode;
		page     = query.page;

		durationInTimeUnits = calculateDurationByMode(dateFrom, dateTo, mode);
		if (query.pageCount > 1) {
			offset = { from: ((page - 1) * itemsPerPage) };
			offset.to = offset.from;
			if ((durationInTimeUnits - offset.from) < itemsPerPage) {
				offset.to += durationInTimeUnits - offset.from;
			} else {
				offset.to += itemsPerPage;
			}
			offset.to -= 1;

			currentDate = copyDbDate(dateFrom);
			floorToTimeUnit(currentDate, mode);
			while (timeUnitsCount <= offset.to) {
				if (timeUnitsCount === offset.from && query.page > 1) {
					dateFrom = copyDbDate(currentDate);
				}
				if (timeUnitsCount === offset.to && query.page < query.pageCount) {
					dateTo = incrementDateByTimeUnit(copyDbDate(currentDate), mode);
					dateTo.setUTCDate(dateTo.getUTCDate() - 1);
				}
				timeUnitsCount++;
				incrementDateByTimeUnit(currentDate, mode);
			}
		}
		serverQuery.dateFrom = dateFrom.toJSON();
		serverQuery.dateTo = dateTo.toJSON();

		delete serverQuery.service;
		delete serverQuery.page;
		delete serverQuery.certificate;
		delete serverQuery.status;
		delete serverQuery.pageCount;

		queryServer(serverQuery).done(function (responseData) {
			data.value = filterData(reduceResult(responseData),
				assign(query, { dateFrom: dateFrom, dateTo: dateTo }));
			pagination.count.value   = query.pageCount;
			pagination.current.value = query.page;
		});
	});

	div({ class: 'block-pull-up' },
		form({ action: '/files/by-role/', autoSubmit: true },
			section({ class: 'date-period-selector-positioned-on-submenu' }, dateFromToBlock()),
			section({ class: 'section-primary users-table-filter-bar display-flex flex-wrap' },
				div(
					div({ class: 'users-table-filter-bar-status width-30' },
						selectService({ label: _("All services") })),
					div({ class: 'users-table-filter-bar-status width-30' },
						selectCertificate(),
						legacy('selectMatch', 'service-select', serviceToCertLegacyMatch)),
					div({ class: 'users-table-filter-bar-status width-30' },
						select(
							{ id: 'step-status', name: 'status' },
							list(Object.keys(stepStatuses), function (status) {
								return option({
									id: 'status-' + status,
									value: status,
									selected: location.query.get('status').map(function (value) {
										var selected = (status ? (value === status) : (value == null));
										return selected ? 'selected' : null;
									})
								}, stepStatuses[status].label);
							})
						))
				),
				selectPeriodMode(),
				div(
					div(
						a({
							class: 'users-table-filter-bar-print',
							href: getDynamicUrl('/flow-roles-data.pdf', { only: params }),
							target: '_blank'
						}, span({ class: 'fa fa-print' }), " ", _("Print pdf"))
					),
					div(
						a({
							class: 'users-table-filter-bar-print',
							href: getDynamicUrl('/flow-roles-data.csv', { only: params }),
							target: '_blank'
						}, span({ class: 'fa fa-print' }), " ", _("Print csv"))
					)
				),
				p({ class: 'submit' }, input({ type: 'submit' })))),

		section({ class: 'pad-if-pagination' }, pagination),
		br(),
			data.map(function (result) {
			var mode = modes.get(location.query.mode || 'daily'), currentTable, container;
			container = div({ class: 'overflow-x table-responsive-container' },
					currentTable = table({ class:
						'submitted-user-data-table statistics-table statistics-flow-roles-table' },
					thead(tr(
						th({ class: 'statistics-table-number' }, mode.labelNoun),
						list(Object.keys(processingSteps), function (shortStepPath) {
							return th({ class: 'statistics-table-number' },
								getStepLabelByShortPath(shortStepPath));
						})
					)
						),
					tbody({
						onEmpty: tr(td({ class: 'empty', colspan: Object.keys(processingSteps).length },
							_("No data for this criteria")))
					}, Object.keys(result), function (key) {
						return tr(
							td(key),
							Object.keys(result[key]).length ?
									list(Object.keys(result[key]), function (step) {
										return td({ class: 'statistics-table-number' },
											result[key][step] == null ? _("N/A") : result[key][step]);
									}) : td({
								class: 'statistics-table-info',
								colspan: Object.keys(processingSteps).length
							}, _("Nothing to report for this period"))
						);
					})));
			initTableSortingOnClient(currentTable);
			return container;
		}));
};
