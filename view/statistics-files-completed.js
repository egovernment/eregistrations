'use strict';

var db                    = require('../db')
  , _                     = require('mano').i18n
  , getData               = require('mano/lib/client/xhr-driver').get
  , location              = require('mano/lib/client/location')
  , memoize               = require('memoizee')
  , ObservableValue       = require('observable-value')
  , capitalize            = require('es5-ext/string/#/capitalize')
  , toArray               = require('es5-ext/object/to-array')
  , setupQueryHandler     = require('../utils/setup-client-query-handler')
  , getQueryHandlerConf   = require('../apps/statistics/get-query-conf')
  , completedFilesPeriods = ['inPeriod', 'today', 'thisWeek', 'thisMonth', 'thisYear',
		'sinceLaunch'];

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
			bpData.value = queryResult;
		});
	});

	return [
		section(
			{ class: 'section-primary users-table-filter-bar' },
			form(
				{ action: '/files/', autoSubmit: true },
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
				th({ class: 'statistics-table-header-waiting' }, _("Service")),
				th({ class: 'statistics-table-number' }, _("Period")),
				th({ class: 'statistics-table-number' }, _("Today")),
				th({ class: 'statistics-table-number' }, _("This week")),
				th({ class: 'statistics-table-number' }, _("This month")),
				th({ class: 'statistics-table-number' }, _("This year")),
				th({ class: 'statistics-table-number' }, _("Since launch"))
			)),
			tbody(
				mmap(bpData, function (data) {
					if (!data) return;

					return [
						toArray(data.byService, function (serviceData, serviceName) {
							return tr(
								td(db['BusinessProcess' + capitalize.call(serviceName)].prototype.label),
								list(completedFilesPeriods, function (periodName) {
									var total = data.total[periodName]
									  , count = serviceData[periodName];

									return td({ class: 'statistics-table-number' }, count, ' ',
										'(', (total ? ((count / total) * 100) : 0).toFixed(2), '%)');
								})
							);
						}),
						tr(
							td(_("Total")),
							list(completedFilesPeriods, function (periodName) {
								return td({ class: 'statistics-table-number' },
									data.total[periodName], ' ', '(100.00%)');
							})
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
			th(_("Service")),
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
						td(data.label),
						td({ class: 'statistics-table-number' }, data.data._waiting),
						td({ class: 'statistics-table-number' }, data.data._pending),
						td({ class: 'statistics-table-number' }, data.data._rejected),
						td({ class: 'statistics-table-number' }, data.data._approved));
				});
			})
		));
};
