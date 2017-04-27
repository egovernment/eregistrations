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
  , itemsPerPage      = require('../conf/objects-list-items-per-page')
  , serviceQuery      = require('../apps-common/query-conf/service')
  , certificateQuery  = require('../apps-common/query-conf/certificate')
  , pageQuery         = require('../utils/query/date-constrained-page')
  , copyDbDate        = require('../utils/copy-db-date')
  , queryServer       = require('./utils/statistics-flow-query-server')
  , filterData        = require('../utils/statistics-flow-certificates-filter-result')
  , incrementDateByTimeUnit = require('../utils/increment-date-by-time-unit')
  , floorToTimeUnit         = require('../utils/floor-to-time-unit')
  , calculateDurationByMode = require('../utils/calculate-duration-by-mode')
  , dateFromToBlock         = require('./components/filter-bar/select-date-range-safe-fallback')
  , getDynamicUrl           = require('./utils/get-dynamic-url');

exports._parent        = require('./statistics-flow');
exports._customFilters = Function.prototype;

exports['flow-nav']                = { class: { 'submitted-menu-item-active': true } };
exports['flow-by-certificate-nav'] = { class: { 'pills-nav-active': true } };

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
	  , pagination = new Pagination('/flow/'), handlerConf, params;

	handlerConf = queryHandlerConf.slice(0);
	handlerConf.push(pageQuery, serviceQuery, certificateQuery);
	queryHandler = setupQueryHandler(handlerConf,
		location, '/flow/');

	params = queryHandler._handlers.map(function (handler) {
		return handler.name;
	});

	queryHandler.on('query', function (query) {
		var serverQuery = copy(query), dateFrom, dateTo, mode
		  , currentDate, offset, timeUnitsCount = 0, durationInTimeUnits, page;

		dateFrom = query.dateFrom;
		dateTo   = query.dateTo;
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
		delete serverQuery.pageCount;

		queryServer(serverQuery).done(function (responseData) {
			data.value = filterData(responseData, assign(query, { dateFrom: dateFrom, dateTo: dateTo }));
			pagination.count.value   = query.pageCount;
			pagination.current.value = query.page;
		});
	});

	div({ class: 'block-pull-up' }, form({ action: '/flow/', autoSubmit: true },
		section({ class: 'date-period-selector-positioned-on-submenu' }, dateFromToBlock()),
		section({ class: 'section-primary users-table-filter-bar display-flex flex-wrap' },
			div(
				div({ class: 'users-table-filter-bar-status' },
					selectService({ label: _("All services") })),
				div({ class: 'users-table-filter-bar-status' },
					selectCertificate(),
					legacy('selectMatch', 'service-select', serviceToCertLegacyMatch))
			),
			br(),
			selectPeriodMode(),
			div(
				div(a({
					class: 'users-table-filter-bar-print',
					href: getDynamicUrl('/flow-certificates-data.pdf', { only: params }),
					target: '_blank'
				}, span({ class: 'fa fa-print' }), " ", _("Print pdf"))),
				div(a({
					class: 'users-table-filter-bar-print',
					href: getDynamicUrl('/flow-certificates-data.csv', { only: params }),
					target: '_blank'
				}, span({ class: 'fa fa-print' }), " ", _("Print csv")))
			),
			p({ class: 'submit' }, input({ type: 'submit' }))),
		section({ class: 'pad-if-pagination' }, pagination),
		br(),
		section({ class: "section-primary" },
			data.map(function (result) {
				var mode = modes.get(location.query.mode || 'daily');
				return table({ class: 'statistics-table' },
					thead(
						th({ class: 'statistics-table-number' }, mode.labelNoun),
						th({ class: 'statistics-table-number' }, _("Submitted")),
						th({ class: 'statistics-table-number' }, _("Pending")),
						th({ class: 'statistics-table-number' }, _("Ready for withdraw")),
						th({ class: 'statistics-table-number' }, _("Withdrawn by user")),
						th({ class: 'statistics-table-number' }, _("Rejected")),
						th({ class: 'statistics-table-number' }, _("Sent back for correction"))
					),
					tbody({
						onEmpty: tr(td({ class: 'empty', colspan: 7 },
							_("No data for this criteria")))
					}, Object.keys(result), function (key) {
						return tr(
							td(key),
							list(Object.keys(result[key]), function (status) {
								return td({ class: 'statistics-table-number' }, result[key][status]);
							})
						);
					}));
			}))));
};
