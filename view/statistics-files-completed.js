'use strict';

var db                    = require('../db')
  , _                     = require('mano').i18n
  , getData               = require('mano/lib/client/xhr-driver').get
  , location              = require('mano/lib/client/location')
  , memoize               = require('memoizee')
  , ObservableValue       = require('observable-value')
  , capitalize            = require('es5-ext/string/#/capitalize')
  , tableColumns          = require('./components/table-columns')
  , toArray               = require('es5-ext/object/to-array')
  , setupQueryHandler     = require('../utils/setup-client-query-handler')
  , getQueryHandlerConf   = require('../apps/statistics/get-query-conf')
  , dateFromToBlock       = require('./components/filter-bar/select-date-range-safe-fallback')
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

	return div({ class: 'block-pull-up' }, [
		section(
			{ class: 'date-period-selector-positioned-on-submenu' },
			form(
				{ action: '/files/', autoSubmit: true },
				dateFromToBlock()
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
									var count = serviceData[periodName];

									return td({ class: 'statistics-table-number' }, count);
								})
							);
						}),
						tr(
							td(_("Total")),
							list(completedFilesPeriods, function (periodName) {
								return td({ class: 'statistics-table-number' },
									data.total[periodName]);
							})
						)
					];
				})
			)
		)
	]);
};

exports['statistics-main'] = function () {
	var certificates = {};

	this.statistics.businessProcess.forEach(function (serviceData, serviceName) {
		var BusinessProcess      = db['BusinessProcess' + capitalize.call(serviceName)]
		  , businessProcessProto = BusinessProcess.prototype
		  , certificatesMap      = businessProcessProto.certificates.map;

		serviceData.certificate.forEach(function (certificateData, certificateName) {
			if (!certificates[certificateName]) {
				certificates[certificateName] = { document: certificatesMap[certificateName], data: [] };
			}

			certificates[certificateName].data.push({
				data: certificateData,
				label: businessProcessProto.label,
				businessProcessType: BusinessProcess
			});
		});
	});

	insert(getTimeBreakdownTable.call(this));

	table({ class: 'statistics-table statistics-table-registrations' },
		thead(tr(
			th(_("Certificate")),
			th(),
			th({ class: "statistics-table-header-waiting" }, _("Submitted")),
			th({ class: "statistics-table-header-pending" }, _("Pending")),
			th({ class: "statistics-table-header-sentback" }, _("Pending for correction")),
			th({ class: "statistics-table-header-sentback" }, _("Rejected")),
			th({ class: "statistics-table-header-success" }, _("Validated")),
			th({ class: "statistics-table-header-success" }, _("Processed and ready for pickup")),
			th({ class: "statistics-table-header-success" }, _("Withdrawn"))
		)),
		tbody(
			toArray(certificates, function (data) {
				var doc = data.document;
				return data.data.map(function (data) {
					return tr(
						td(doc.abbr),
						td(span({
							class: 'hint-optional hint-optional-right',
							'data-hint': data.label
						}, tableColumns.getServiceIcon({ constructor: data.businessProcessType }))),
						td({ class: 'statistics-table-number' }, data.data._waiting),
						td({ class: 'statistics-table-number' }, data.data._pending),
						td({ class: 'statistics-table-number' }, data.data._sentBack),
						td({ class: 'statistics-table-number' }, data.data._rejected),
						td({ class: 'statistics-table-number' }, data.data._approved),
						td({ class: 'statistics-table-number' }, data.data._pickup),
						td({ class: 'statistics-table-number' }, data.data._withdrawn)
					);
				});
			})
		));

	setTimeout(function () {
		window.jQuery('.statistics-table-registrations').tablesorter()
	});
};
