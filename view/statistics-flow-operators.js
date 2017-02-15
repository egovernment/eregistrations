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
  , incrementDateByTimeUnit = require('../utils/increment-date-by-time-unit')
  , floorToTimeUnit         = require('../utils/floor-to-time-unit')
  , calculateDurationByMode = require('../utils/calculate-duration-by-mode');

exports._parent        = require('./statistics-flow');
exports._customFilters = Function.prototype;

exports['flow-nav']                = { class: { 'submitted-menu-item-active': true } };
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

var buildResultRow = function (rowData) {
	return assign({
		submitted: 0,
		pending: 0,
		pickup: 0,
		withdrawn: 0,
		rejected: 0,
		sentBack: 0
	}, rowData || {});
};

var accumulateResultRows = function (rows) {
	var result = buildResultRow(rows[0]);
	rows.slice(1).forEach(function (row) {
		Object.keys(row).forEach(function (propertyName) {
			result[propertyName] += row[propertyName];
		});
	});

	return result;
};

var buildFilteredResult = function (data, key, service, certificate) {
	if (!data[key]) return buildResultRow();
	if (service && certificate) {
		return buildResultRow(data[key][service].certificate[certificate]);
	}
	if (service) {
		return buildResultRow(data[key][service].businessProcess);
	}
	var rowsToAccumulate = [];
	Object.keys(data[key]).forEach(function (service) {
		if (certificate) {
			if (!data[key][service].certificate[certificate]) return;
			rowsToAccumulate.push(data[key][service].certificate[certificate]);
		} else {
			rowsToAccumulate.push(data[key][service].businessProcess);
		}
	});
	return accumulateResultRows(rowsToAccumulate);
};

var filterData = function (data, query) {
	var result = {};

	Object.keys(data).forEach(function (date) {
		result[date] = buildFilteredResult(data, date, query.service, query.certificate);
	});

	return result;
};

exports['statistics-main'] = function () {
	var queryHandler, tables = new ObservableValue({})
	  , pagination = new Pagination('/flow/'), handlerConf;

	tables.value = {
		revision: new ObservableValue({}),
		precal: new ObservableValue({})
	};

	handlerConf = queryHandlerConf.slice(0);
	handlerConf.push(pageQuery, serviceQuery, certificateQuery);
	queryHandler = setupQueryHandler(handlerConf,
		location, '/flow/by-operator/');

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
		delete serverQuery.pageCount;

		queryServer(serverQuery).done(function (responseData) {
			var filteredData = filterData(responseData,
				assign(query, { dateFrom: dateFrom, dateTo: dateTo }));
			tables.value.revision.value = filteredData;
			tables.value.precal.value = filteredData;
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
			div(
				{ class: 'users-table-filter-bar-status' },
				label({ for: 'date-from-input' }, _("Date from"), ":"),
				input({ id: 'date-from-input', type: 'date',
					name: 'dateFrom', value: location.query.get('dateFrom').map(function (dateFrom) {
					var now = new db.Date();
					now.setDate(now.getDate() - 7);
					return dateFrom || now.toISOString().slice(0, 10);
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
				if (!result) return;
				return section({ class: "section-primary" },
					h3(key),
					table({ class: 'statistics-table' },
						thead(
							th({ class: 'statistics-table-number' },
								location.query.get("mode").map(function (mode) {
									var title;
									if (!mode) return;
									modes.some(function (m) {
										if (mode === m.key) {
											title = m.labelNoun;
											return true;
										}
									});
									return title;
								})),
							th({ class: 'statistics-table-number' }, _("Operator")),
							th({ class: 'statistics-table-number' }, _("Files Processed")),
							th({ class: 'statistics-table-number' }, _("Validated")),
							th({ class: 'statistics-table-number' }, _("Sent Back for corrections")),
							th({ class: 'statistics-table-number' }, _("Rejected"))
						),
						tbody({ onEmpty: tr(td({ class: 'empty', colspan: 6 },
							_("No data for this criteria"))) }, Object.keys(result), function (key) {
							return tr(
								td(key),
								list(Object.keys(result[key]), function (status) {
									return td({ class: 'statistics-table-number' }, result[key][status]);
								})
							);
						})));
			});
		}));
};
