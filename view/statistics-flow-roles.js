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
  , isNaturalNumber   = require('es5-ext/number/is-natural')
  , serviceQuery      = require('../apps-common/query-conf/service')
  , certificateQuery  = require('../apps-common/query-conf/certificate')
  , stepStatusQuery   = require('../apps-common/query-conf/processing-step-status')
  , copyDbDate        = require('../utils/copy-db-date')
  , queryServer       = require('./utils/statistics-flow-query-server')
  , processingSteps   = require('../processing-steps-meta')
  , getStepLabelByShortPath = require('../utils/get-step-label-by-short-path');

exports._parent        = require('./statistics-flow');
exports._customFilters = Function.prototype;

exports['flow-nav']                = { class: { 'submitted-menu-item-active': true } };
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
Object.keys(processingSteps).forEach(function (step) {
	Object.keys(processingSteps[step]).forEach(function (statusKey) {
		if (statusKey === 'all') return;
		stepStatuses[statusKey] = processingSteps[step][statusKey];
	});
});

var buildResultRow = function (rowData, queryCertificate, queryStatus) {
	var resultRow = {}, reducedRowData;
	Object.keys(processingSteps).forEach(function (stepKey) {
		resultRow[stepKey] = 0;
	});
	Object.keys(rowData).forEach(function (stepShortPath) {
		Object.keys(rowData[stepShortPath]).forEach(function (status) {
			if (status !== queryStatus) return;

			reducedRowData = rowData[stepShortPath][status];
			if (queryCertificate) {
				reducedRowData = reducedRowData.certificate[queryCertificate];
			} else {
				reducedRowData = reducedRowData.businessProcess;
			}
			resultRow[stepShortPath] = reducedRowData;
		});
	});
	return resultRow;
};

var incrementDateByTimeUnit = function (date, mode) {
	switch (mode) {
	case 'weekly':
		date.setUTCDate(date.getUTCDate() + 7);
		break;
	case 'monthly':
		date.setUTCMonth(date.getUTCMonth() + 1);
		break;
	case 'yearly':
		date.setUTCFullYear(date.getUTCFullYear() + 1);
		break;
	default:
		date.setUTCDate(date.getUTCDate() + 1);
		break;
	}

	return date;
};

var buildFilteredResult = function (data, key, service, certificate, status) {
	var resultRow, finalResult = {};
	if (service) {
		return buildResultRow(data[key][service].processingStep, certificate, status);
	}

	Object.keys(data[key]).forEach(function (serviceKey) {
		resultRow = buildResultRow(data[key][serviceKey].processingStep, certificate, status);
		// accumulate
		Object.keys(resultRow).forEach(function (stepShortPath) {
			if (!finalResult[stepShortPath]) {
				finalResult[stepShortPath] = 0;
			}
			finalResult[stepShortPath] += resultRow[stepShortPath];
		});
	});

	return finalResult;
};

var floorToUnit = function (date, mode) {
	switch (mode) {
	case 'weekly':
		var dayOfWeek = date.getUTCDay(), modifier;
		if (dayOfWeek === 0) {
			modifier = -6;
		} else {
			modifier = -(dayOfWeek - 1);
		}
		date.setUTCDate(date.getUTCDate() + modifier);
		break;
	case 'monthly':
		date.setUTCDate(1);
		break;
	case 'yearly':
		date.setUTCDate(1);
		date.setUTCMonth(0);
		break;
	default:
		break;
	}

	return date;
};

var filterData = function (data, query) {
	var result = {}, service, certificate, dateTo, currentDate, mode, key, status;
	service     = query.service;
	certificate = query.certificate;
	status      = query.status;
	currentDate = copyDbDate(query.dateFrom);
	dateTo      = copyDbDate(query.dateTo);
	modes.some(function (modeItem) {
		if (modeItem.key === query.mode) {
			mode = modeItem;
			return true;
		}
	});
	floorToUnit(currentDate, mode.key);
	while (currentDate <= dateTo) {
		key         = mode.getDisplayedKey(currentDate);
		result[key] = buildFilteredResult(data, key, service, certificate, status);
		incrementDateByTimeUnit(currentDate, mode.key);
	}

	return result;
};

var calculateDurationByMode = function (dateFrom, dateTo, mode) {
	var timeUnitsCount = 0, currentDate;
	currentDate = copyDbDate(dateFrom);
	if (!dateTo) dateTo = new db.Date();

	floorToUnit(currentDate, mode);
	while (currentDate <= dateTo) {
		incrementDateByTimeUnit(currentDate, mode);
		timeUnitsCount++;
	}
	return timeUnitsCount;
};

exports['statistics-main'] = function () {
	var queryHandler, data = new ObservableValue({})
	  , pagination = new Pagination('/flow/by-role/'), handlerConf;

	handlerConf = queryHandlerConf.slice(0);
	handlerConf.push({
		name: 'page',
		ensure: function (value, resolvedQuery, query) {
			var num, dateFrom, dateTo, mode, durationInTimeUnits, resolvedValue;
			resolvedValue = value;
			if (resolvedValue == null) resolvedValue = '1';
			if (isNaN(resolvedValue)) throw new Error("Unrecognized page value " + JSON.stringify(value));
			num = Number(resolvedValue);
			if (!isNaturalNumber(num)) throw new Error("Unreconized page value " + JSON.stringify(value));
			if (num < 1) throw new Error("Unexpected page value " + JSON.stringify(value));

			dateFrom = resolvedQuery.dateFrom;
			dateTo   = resolvedQuery.dateTo || new db.Date();
			mode     = resolvedQuery.mode;
			durationInTimeUnits     = calculateDurationByMode(dateFrom, dateTo, mode);
			resolvedQuery.pageCount = Math.ceil(durationInTimeUnits / itemsPerPage);
			if (num > resolvedQuery.pageCount) throw new Error("Page value overflow");
			return num;
		}
	}, serviceQuery, certificateQuery, stepStatusQuery);
	queryHandler = setupQueryHandler(handlerConf,
		location, '/flow/by-role/');

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
			floorToUnit(currentDate, mode);
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

		queryServer(serverQuery).done(function (responseData) {
			console.log('responseData', responseData);
			data.value = filterData(responseData, assign(query, { dateFrom: dateFrom, dateTo: dateTo }));
			pagination.count.value   = query.pageCount;
			pagination.current.value = query.page;
		});
	});

	section({ class: 'section-primary users-table-filter-bar' },
		form({ action: '/flow/by-role/', autoSubmit: true },
			div({ class: 'users-table-filter-bar-status' },
				selectService({ label: _("All services") })),
			div({ class: 'users-table-filter-bar-status' },
				selectCertificate(),
				legacy('selectMatch', 'service-select', serviceToCertLegacyMatch)),

			div({ class: 'users-table-filter-bar-status' },
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
				)),

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
		data.map(function (result) {
			return table({ class: 'statistics-table' },
				thead(
					th({ class: 'statistics-table-number' }, location.query.get("mode").map(function (mode) {
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
					list(Object.keys(processingSteps), function (shortStepPath) {
						return th({ class: 'statistics-table-number' }, getStepLabelByShortPath(shortStepPath));
					})
				),
				tbody({ onEmpty: tr(td({ class: 'empty', colspan: Object.keys(processingSteps).length },
					_("No data for this criteria"))) }, Object.keys(result), function (key) {
					return tr(
						td(key),
						list(Object.keys(result[key]), function (step) {
							return td({ class: 'statistics-table-number' }, result[key][step]);
						})
					);
				}));
		}));
};
