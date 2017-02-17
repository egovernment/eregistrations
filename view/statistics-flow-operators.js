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
  , selectUser        = require('./components/filter-bar/select-user')
  , serviceQuery      = require('../apps-common/query-conf/service')
  , certificateQuery  = require('../apps-common/query-conf/certificate')
  , pageQuery         = require('../utils/query/date-constrained-page')
  , processingSteps   = require('../processing-steps-meta')
  , queryServer       = require('./utils/statistics-flow-query-server')
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

var buildResultByProcessor = function (finalResult, row, processorId, certificate) {
	if (!finalResult[processorId]) {
		finalResult[processorId] = {};
	}
	['approved', 'sentBack', 'rejected'].forEach(function (status) {
		if (!row[status]) return;
		if (!finalResult[processorId][status]) {
			finalResult[processorId][status] = 0;
		}
		if (!finalResult[processorId].processed) {
			finalResult[processorId].processed = 0;
		}
		if (certificate) {
			if (!row[status].certificate[certificate]) return;
			finalResult[processorId][status] += row[status].certificate[certificate];
			finalResult[processorId].processed += row[status].certificate[certificate];
		} else {
			finalResult[processorId][status] += row[status].businessProcess;
			finalResult[processorId].processed += row[status].businessProcess;
		}
	});
};

var buildFilteredResult = function (data, date, service, certificate, step, processor) {
	var finalResult = {}, reducedRows = [data], row;

	if (service) {
		reducedRows = reducedRows.map(function (reducedRow) {
			return reducedRow[service];
		});
	} else {
		reducedRows = Object.keys(reducedRows[0]).map(function (serviceName) {
			return reducedRows[0][serviceName];
		});
	}
	reducedRows = reducedRows.map(function (row) {
		return row.processingStep[step].byProcessor;
	});

	reducedRows.forEach(function (reducedRow) {
		if (processor) {
			row = reducedRow[processor];
			if (!row) {
				finalResult[processor] = {};
				return;
			}
			buildResultByProcessor(finalResult, row, processor, certificate);
		} else {
			Object.keys(reducedRow).forEach(function (processorId) {
				row = reducedRow[processorId];
				buildResultByProcessor(finalResult, row, processorId, certificate);
			});
		}
	});

	return Object.keys(finalResult).map(function (processorId) {
		return assign({
			date: date,
			processor: null,
			processed: 0,
			approved: 0,
			sentBack: 0,
			rejected: 0
		}, { processor: processorId }, finalResult[processorId]);
	});
};

var filterData = function (data, query) {
	var result = [];
	Object.keys(data).forEach(function (date) {
		Array.prototype.push.apply(result, buildFilteredResult(data[date], date,
			query.service, query.certificate, query.step, query.processor));
	});

	return result;
};

exports['statistics-main'] = function () {
	var queryHandler, tables = new ObservableValue({})
	  , pagination = new Pagination('/flow/'), handlerConf, tablesValue = {};

	Object.keys(processingSteps).forEach(function (stepShortPath) {
		tablesValue[stepShortPath] = new ObservableValue({});
	});

	tables.value = tablesValue;

	handlerConf = queryHandlerConf.slice(0);
	handlerConf.push(pageQuery, serviceQuery, certificateQuery, {
		name: 'processor',
		ensure: function (value) {
			if (!value) return;

			if (!usersCollection.getById(value)) {
				throw new Error("Unrecognized processor value " + JSON.stringify(value));
			}

			return value;
		}
	});
	queryHandler = setupQueryHandler(handlerConf,
		location, '/flow/by-operator/');

	queryHandler.on('query', function (query) {
		var serverQuery = copy(query), dateFrom, dateTo;

		dateFrom = query.dateFrom;
		dateTo   = query.dateTo || new db.Date();

		serverQuery.dateFrom = dateFrom.toJSON();
		serverQuery.dateTo = dateTo.toJSON();

		delete serverQuery.service;
		delete serverQuery.certificate;
		delete serverQuery.pageCount;

		queryServer(serverQuery).done(function (responseData) {
			if (query.step) {
				tables.value[query.step].value = filterData(responseData,
					assign(query, { dateFrom: dateFrom, dateTo: dateTo }));
			} else {
				Object.keys(tables.value).forEach(function (stepShortPath) {
					tables.value[stepShortPath].value = filterData(responseData,
						assign({ step: stepShortPath }, query, { dateFrom: dateFrom, dateTo: dateTo }));
				});
			}

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
				if (!result || !result.length) return;
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
							_("No data for this criteria"))) }, result, function (resultRow) {
							return tr(
								list(Object.keys(resultRow), function (prop) {
									return td({ class: 'statistics-table-number' }, resultRow[prop]);
								})
							);
						})));
			});
		}));
};
