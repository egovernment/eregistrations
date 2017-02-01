'use strict';

var _            = require('mano').i18n.bind('View: Statistics')
  , db           = require('../db')
  , uncapitalize = require('es5-ext/string/#/uncapitalize')
  , location     = require('mano/lib/client/location')
  , getQueryHandlerConf = require('../apps/statistics/get-query-conf')
  , setupQueryHandler   = require('../utils/setup-client-query-handler')
  , getData             = require('mano/lib/client/xhr-driver').get
  , memoize             = require('memoizee')
  , copy                = require('es5-ext/object/copy')
  , ObservableValue     = require('observable-value')
  , assign              = require('es5-ext/object/assign')
  , Pagination          = require('./components/pagination')
  , Duration            = require('duration')
  , itemsPerPage        = 100;

exports._parent        = require('./statistics-flow');
exports._customFilters = Function.prototype;

exports['flow-nav']                = { class: { 'submitted-menu-item-active': true } };
exports['flow-by-certificate-nav'] = { class: { 'pills-nav-active': true } };

var queryServer = memoize(function (query) {
	return getData('/get-flow-data/', query);
}, {
	normalizer: function (args) { return JSON.stringify(args[0]); },
	max: 1000
});

var serviceToCertLegacyMatch = { all: [] };

var certificates = {};

var getServiceName = function (ServiceType) {
	return uncapitalize.call(
		ServiceType.__id__.slice('BusinessProcess'.length)
	);
};

db.BusinessProcess.extensions.forEach(function (ServiceType) {
	ServiceType.prototype.certificates.map.forEach(function (certificate) {
		if (!certificates[certificate.key]) {
			certificates[certificate.key] = { label: certificate.label };
		}
		if (!serviceToCertLegacyMatch[getServiceName(ServiceType)]) {
			serviceToCertLegacyMatch[getServiceName(ServiceType)] = [];
		}
		serviceToCertLegacyMatch[getServiceName(ServiceType)].push('certificate-' + certificate.key);
		serviceToCertLegacyMatch.all.push('certificate-' + certificate.key);
	});
});

// TODO: remove this
var getDummyData = require('../stats-dummy-data');

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

var filterData = function (data) {
	var result = {};
	location.query.get('service').map(function (service) {
		location.query.get('certificate').map(function (certificate) {
			Object.keys(data).forEach(function (key) {
				if (service !== 'all' && certificate) {
					result[key] = buildResultRow(data[key][service].certificate[certificate]);
				} else if (service !== 'all') {
					result[key] = buildResultRow(data[key][service].businessProcess);
				} else {
					var rowsToAccumulate = [];
					Object.keys(data[key]).forEach(function (service) {
						if (certificate) {
							if (!data[key][service].certificate[certificate]) return;
							rowsToAccumulate.push(data[key][service].certificate[certificate]);
						} else {
							rowsToAccumulate.push(data[key][service].businessProcess);
						}
					});
					result[key] = accumulateResultRows(rowsToAccumulate);
				}
			});
		});
	});

	return result;
};

var calculateDurationByMode = function (duration, mode) {
	var result;
	switch (mode) {
	case 'weekly':
		result = Math.ceil(duration.days / 7);
		break;
	case 'monthly':
		result = duration.months;
		break;
	case 'yearly':
		result = duration.years;
		break;
	default:
		result = duration.days;
		break;
	}

	return result;
};

exports['statistics-main'] = function () {
	var queryHandler, data = new ObservableValue({}), pagination = new Pagination('/flow/');
	queryHandler = setupQueryHandler(getQueryHandlerConf({
		processingStepsMeta: this.processingStepsMeta
	}), location, '/flow/');
	queryHandler.on('query', function (query) {
		var serverQuery = copy(query), dateFrom, dateTo, now, mode
		  , duration, currentDate, offset, daysCount = 0, timeUnit;
		now      = new db.Date();
		dateFrom = new db.Date(serverQuery.dateFrom);
		dateTo = serverQuery.dateTo || new db.Date(now.getFullYear(), now.getMonth(), now.getDate());
		dateTo = new db.Date(dateTo);
		duration = new Duration(dateFrom, dateTo);
		mode = location.query.get('mode').map(function (mode) {
			return mode;
		}).value;
		timeUnit = calculateDurationByMode(duration, mode);
		pagination.count.value = Math.ceil(timeUnit / itemsPerPage);
		pagination.current.value = location.query.get('page').map(function (page) {
			return Number(page) || 1;
		});
		if (pagination.count.value > 1) {
			offset = { from: ((pagination.current.value - 1) * itemsPerPage) };
			offset.to = offset.from;
			if (timeUnit - offset.from < itemsPerPage) {
				offset.to += timeUnit - offset.from;
			} else {
				offset.to += itemsPerPage;
			}

			currentDate = dateFrom;
			while (daysCount <= offset.to) {
				if (daysCount === offset.from) {
					dateFrom = currentDate;
				}
				if (daysCount === offset.to) {
					dateTo = currentDate;
				}
				daysCount++;
				switch (mode) {
				case 'weekly':
					currentDate = new db.Date(currentDate.getFullYear(),
							currentDate.getMonth(), currentDate.getDate() + 7);
					break;
				case 'monthly':
					currentDate = new db.Date(currentDate.getFullYear(),
							currentDate.getMonth() + 1);
					break;
				case 'yearly':
					currentDate = new db.Date(currentDate.getFullYear() + 1);
					break;
				default:
					currentDate = new db.Date(currentDate.getFullYear(),
							currentDate.getMonth(), currentDate.getDate() + 1);
					break;
				}
			}
		}
		if (dateFrom) {
			serverQuery.dateFrom = dateFrom.toJSON();
		}
		if (dateTo) {
			serverQuery.dateTo = dateTo.toJSON();
		}

		queryServer(serverQuery).done(function (responseData) {
			//TODO remove below line
			var d = getDummyData({ dateFrom: dateFrom, dateTo: dateTo, mode: mode });
			data.value = filterData(d);
		});
	});

	section({ class: 'section-primary users-table-filter-bar' },
		form({ action: '/flow/', autoSubmit: true },
			div({ class: 'users-table-filter-bar-status' },
				select(
					{ id: 'service-select', name: 'service' },
					option({ value: 'all', selected: location.query.get('service').map(function (value) {
						return !value || value === 'all' ? 'selected' : null;
					}) }, _("All services")),
					list(db.BusinessProcess.extensions, function (ServiceType) {
						var serviceName = getServiceName(ServiceType);
						return option({
							value: serviceName,
							selected: location.query.get('service').map(function (value) {
								var selected = (serviceName ? (value === serviceName) : (value == null));
								return selected ? 'selected' : null;
							})
						}, ServiceType.prototype.label);
					})
				)),
			div({ class: 'users-table-filter-bar-status' },
				select(
					{ id: 'certificate-select', name: 'certificate' },
					option({ value: '', selected: location.query.get('certificate').map(function (value) {
						return value ? null : 'selected';
					}) }, _("All certificates")),
					list(Object.keys(certificates), function (certificateKey) {
						return option({
							id: 'certificate-' + certificateKey,
							value: certificateKey,
							selected: location.query.get('certificate').map(function (value) {
								var selected = (certificateKey ? (value === certificateKey) : (value == null));
								return selected ? 'selected' : null;
							})
						}, certificates[certificateKey].label);
					}),
					legacy('selectMatch', 'service-select', serviceToCertLegacyMatch)
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
			div({ class: "input", id: "mode-selection" },
				div({ class: "inline-button-radio" },
					list([
						{ key: 'daily', label: _('Daily') },
						{ key: 'weekly', label: _('Weeky') },
						{ key: 'monthly', label: _('Monthy') },
						{ key: 'yearly', label: _('Yearly') }], function (mode) {
						label(
							input({
								type: "radio",
								name: "mode",
								value: mode.key,
								checked: location.query.get('mode').map(function (value) {
									var checked = (mode.key ? (value === mode.key) : (value == null));
									return checked ? 'checked' : null;
								})
							}),
							mode.label
						);
					})),
				script((function (id, classMap) {
					var current, radio, radios;
					var onChange = function () {
						var nu, i;
						for (i = 0; (radio = radios[i]); ++i) {
							if (radio.checked) {
								nu = radio;
								break;
							}
						}
							if (nu === current) return;
							if (current) current.parentNode.removeClass('success');
							if (nu) $(nu.parentNode).addClass('success');
						current = nu;
					};
					setTimeout(function self() {
						var container = $(id);
						if (!container) {
							setTimeout(self, 1000);
							return;
						}
						radios = container.getElementsByTagName('input');
						container.addEvent('change', function () {
							setTimeout(onChange, 0);
						});
						container.addEvent('click', function () {
							setTimeout(onChange, 0);
						});
						onChange();
					}, 0);
				}("mode-selection")))),
			p({ class: 'submit' }, input({ type: 'submit' }))));

	section(pagination);
	section({ class: "section-primary" },
		data.map(function (result) {
			return table({ class: 'statistics-table' },
				thead(
					th({ class: 'statistics-table-number' }, _("Day")),
					th({ class: 'statistics-table-number' }, _("Submitted")),
					th({ class: 'statistics-table-number' }, _("Pending")),
					th({ class: 'statistics-table-number' }, _("Ready for withdraw")),
					th({ class: 'statistics-table-number' }, _("Withdrawn by user")),
					th({ class: 'statistics-table-number' }, _("Rejected")),
					th({ class: 'statistics-table-number' }, _("Sent back for correction"))
				),
				tbody({ onEmpty: tr(td({ class: 'empty statistics-table-number', colspan: 7 },
					_("No data for this criteria"))) }, Object.keys(result), function (key) {
					return tr(
						td(key),
						list(Object.keys(result[key]), function (status) {
							return td({ class: 'statistics-table-number' }, result[key][status]);
						})
					);
				}));
		}));
};