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
  , assign              = require('es5-ext/object/assign');

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

var certificates = {};

db.BusinessProcess.extensions.forEach(function (ServiceType) {
	ServiceType.prototype.certificates.map.forEach(function (certificate) {
		certificates[certificate.key] = { label: certificate.label };
	});
});

// TODO: remove this
var dummyData = {
	"2016-01-02": {
		businessProcess: {
			merchant: {
				pending: 20,
				sentBack: 40
			},
			company: {
				pending: 15,
				rejected: 2
			}
		},
		certificate: {
			afpConfia: {
				pending: 30
			}
		}
	}
};

var buildResultRow = function (rowData) {
	return assign({
		submitted: 0,
		pending: 0,
		pickup: 0,
		withdrawn: 0,
		rejected: 0,
		sentBack: 0
	}, rowData);
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
				if (certificate) {
					result[key] = buildResultRow(data[key].certificate[certificate]);
				} else if (service) {
					result[key] = buildResultRow(data[key].businessProcess[service]);
				} else {
					result[key] = accumulateResultRows(Object.values(data[key].businessProcess));
				}
			});
		});
	});

	return result;
};

exports['statistics-main'] = function () {
	var queryHandler, data = new ObservableValue({});
	queryHandler = setupQueryHandler(getQueryHandlerConf({
		processingStepsMeta: this.processingStepsMeta
	}), location, '/flow/');

	queryHandler.on('query', function (query) {
		var serverQuery = copy(query);
		if (serverQuery.dateFrom) {
			serverQuery.dateFrom = serverQuery.dateFrom.toJSON();
		}
		if (serverQuery.dateTo) {
			serverQuery.dateTo = serverQuery.dateTo.toJSON();
		}
		queryServer(serverQuery).done(function (responseData) {
			data.value = filterData(dummyData);
		});
	});

	section({ class: 'section-primary users-table-filter-bar' },
		form({ action: '/flow/', autoSubmit: true },
			div({ class: 'users-table-filter-bar-status' },
				select(
					{ id: 'service-select', name: 'service' },
					option({ value: '', selected: location.query.get('service').map(function (value) {
						return value ? null : 'selected';
					}) }, _("All services")),
					list(db.BusinessProcess.extensions, function (ServiceType) {
						var serviceName = uncapitalize.call(
							ServiceType.__id__.slice('BusinessProcess'.length)
						);
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
							value: certificateKey,
							selected: location.query.get('certificate').map(function (value) {
								var selected = (certificateKey ? (value === certificateKey) : (value == null));
								return selected ? 'selected' : null;
							})
						}, certificates[certificateKey].label);
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
