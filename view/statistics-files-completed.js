'use strict';

var db                   = require('../db')
  , _                    = require('mano').i18n
  , getData              = require('mano/lib/client/xhr-driver').get
  , location             = require('mano/lib/client/location')
  , memoize              = require('memoizee')
  , ObservableValue      = require('observable-value')
  , capitalize           = require('es5-ext/string/#/capitalize')
  , toArray              = require('es5-ext/object/to-array')
  , oForEach             = require('es5-ext/object/for-each')
  , setupQueryHandler    = require('../utils/setup-client-query-handler')
  , getQueryHandlerConf  = require('../apps/statistics/get-query-conf');

exports._parent = require('./statistics-files');

exports['files-nav']           = { class: { 'submitted-menu-item-active': true } };
exports['completed-files-nav'] = { class: { 'pills-nav-active': true } };

var queryServer = memoize(function (query) {
	return getData('/get-files-completed/', query);
}, {
	normalizer: function (args) { return JSON.stringify(args[0]); }
});

var getTimeBreakdownTable = function () {
	var bpData       = new ObservableValue()
	  , queryHandler = setupQueryHandler(getQueryHandlerConf({
		processingStepsMeta: this.processingStepsMeta
	}), location, '/files/');

	queryHandler.on('query', function (query) {
		if (query.dateFrom) {
			query.dateFrom = query.dateFrom.toJSON();
		}
		if (query.dateTo) {
			query.dateTo = query.dateTo.toJSON();
		}
		queryServer(query).done(function (queryResult) {
			var parsedData = {
				byService: {},
				total: {}
			};

			oForEach(queryResult, function (periodData, periodName) {
				if (parsedData.total[periodName] == null) {
					parsedData.total[periodName] = 0;
				}

				oForEach(periodData.byService, function (serviceData, serviceName) {
					var parsedServiceData = parsedData.byService[serviceName]
					  , percentage        = 0;

					if (!parsedServiceData) {
						parsedServiceData = parsedData.byService[serviceName] = {
							label: db['BusinessProcess' + capitalize.call(serviceName)].prototype.label
						};
					}

					if (periodData.total) {
						percentage = (serviceData / periodData.total) * 100;
					}

					parsedServiceData[periodName] = {
						count: serviceData,
						percentage: percentage
					};

					parsedData.total[periodName] += serviceData;
				});
			});

			bpData.value = parsedData;
		});
	});

	return [
		section(
			{ class: 'section-primary users-table-filter-bar' },
			form(
				{ action: '/files', autoSubmit: true },
				div(
					{ class: 'users-table-filter-bar-status' },
					label({ for: 'date-from-input' }, _("Date from"), ":"),
					input({ id: 'date-from-input', type: 'date',
						name: 'dateFrom', value: location.query.get('dateFrom') })
				),
				div(
					{ class: 'users-table-filter-bar-status' },
					label({ for: 'date-to-input' }, _("Date to"), ":"),
					input({ id: 'date-to-input', type: 'date',
						name: 'dateTo', value: location.query.get('dateTo') })
				)
			)
		),
		table(
			{ class: 'statistics-table statistics-table-registrations' },
			thead(tr(
				th({ class: 'statistics-table-number' }, _("Service")),
				th({ class: "statistics-table-header-waiting" }, _("Period")),
				th({ class: "statistics-table-header-pending" }, _("Today")),
				th({ class: "statistics-table-header-sentback" }, _("This week")),
				th({ class: "statistics-table-header-sentback" }, _("This month")),
				th({ class: "statistics-table-header-sentback" }, _("This year")),
				th({ class: "statistics-table-header-success" }, _("Since launch"))
			)),
			tbody(
				mmap(bpData, function (data) {
					if (!data) return;

					return [
						toArray(data.byService, function (serviceData, serviceKey) {
							return tr(
								td(serviceData.label),
								td(serviceData.inPeriod.count, ' ', '(',
									serviceData.inPeriod.percentage, '%)'),
								td(serviceData.today.count, ' ', '(',
									serviceData.today.percentage, '%)'),
								td(serviceData.thisWeek.count, ' ', '(',
									serviceData.thisWeek.percentage, '%)'),
								td(serviceData.thisMonth.count, ' ', '(',
									serviceData.thisMonth.percentage, '%)'),
								td(serviceData.thisYear.count, ' ', '(',
									serviceData.thisYear.percentage, '%)'),
								td(serviceData.sinceLaunch.count, ' ', '(',
									serviceData.sinceLaunch.percentage, '%)')
							);
						}),
						tr(
							td(_("Total")),
							td(data.total.inPeriod, ' ', '(100%)'),
							td(data.total.today, ' ', '(100%)'),
							td(data.total.thisWeek, ' ', '(100%)'),
							td(data.total.thisMonth, ' ', '(100%)'),
							td(data.total.thisYear, ' ', '(100%)'),
							td(data.total.sinceLaunch, ' ', '(100%)')
						)
					];
				})
			)
		)
	];
};

exports['statistics-main'] = function () {
	var certs = {};
	this.statistics.businessProcess.forEach(function (data, name) {
		var proto = db['BusinessProcess' + capitalize.call(name)].prototype
		  , certsMap = proto.certificates.map;
		data.certificate.forEach(function (data, name) {
			if (!certs[name]) certs[name] = { document: certsMap[name], data: [] };
			certs[name].data.push({ data: data, label: proto.label });
		});
	});

	insert(getTimeBreakdownTable.call(this));

	table({ class: 'statistics-table statistics-table-registrations' },
		thead(tr(
			th(),
			th(),
			th({ class: 'statistics-table-number' }, _("Service")),
			th({ class: "statistics-table-header-waiting" }, _("Waiting")),
			th({ class: "statistics-table-header-pending" }, _("Pending")),
			th({ class: "statistics-table-header-sentback" }, _("Rejected")),
			th({ class: "statistics-table-header-success" }, _("Validated"))
		)),
		tbody(
			toArray(certs, function (data) {
				var doc = data.document;
				return data.data.map(function (data) {
					return tr(td(doc.abbr), td(doc.label),
						td({ class: 'statistics-table-number' }, data.label),
						td({ class: 'statistics-table-number' }, data.data._waiting),
						td({ class: 'statistics-table-number' }, data.data._pending),
						td({ class: 'statistics-table-number' }, data.data._rejected),
						td({ class: 'statistics-table-number' }, data.data._approved));
				});
			})
		));
};
