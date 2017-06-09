'use strict';

var _                 = require('mano').i18n.bind('View: Statistics')
  , db                = require('../db')
  , location          = require('mano/lib/client/location')
  , queryHandlerConf  = require('../apps/statistics/flow-query-conf')
  , setupQueryHandler = require('../utils/setup-client-query-handler')
  , copy              = require('es5-ext/object/copy')
  , ObservableValue   = require('observable-value')
  , queryServer       = require('./utils/statistics-certificates-issued-query-server')
  , getDynamicUrl     = require('./utils/get-dynamic-url')
  , dateFromToBlock   = require('./components/filter-bar/select-date-range-safe-fallback')
  , toDateInTz        = require('../utils/to-date-in-time-zone');

exports._parent        = require('./statistics-files');
exports._customFilters = Function.prototype;

exports['files-nav']                = { class: { 'submitted-menu-item-active': true } };
exports['certificates-issued-nav'] = { class: { 'pills-nav-active': true } };

var completedFilesPeriods = [
	{ name: 'inPeriod', label: _("Period") },
	{ name: 'today', label: _("Today") },
	{ name: 'thisWeek', label: _("This week") },
	{ name: 'thisMonth', label: _("This month") }
];
var today = toDateInTz(new Date(), db.timeZone);
var currentYear = new db.Date(today.getUTCFullYear(), 0, 1);
var lastYearInRange = new db.Date(today.getUTCFullYear() - 5, 0, 1);

while (currentYear >= lastYearInRange) {
	completedFilesPeriods.push({
		name: currentYear.getUTCFullYear(),
		label: currentYear.getUTCFullYear()
	});
	currentYear.setUTCFullYear(currentYear.getUTCFullYear() - 1);
}
var approvedCertsPeriods = completedFilesPeriods.slice(0);
approvedCertsPeriods.splice(0, 0, { name: 'certificate', label: _("Certificate") });

var getTablesFromData = function (certData) {
	return table(
		{ id: 'approved-certificates', class: 'statistics-table statistics-table-registrations' },
		thead(tr(
			th({ class: 'statistics-table-header-waiting' }, _("Service")),
			list(approvedCertsPeriods, function (period) {
				return th({ class: 'statistics-table-number' }, period.label);
			})
		)),
		tbody(
			mmap(certData, function (rows) {
				if (!rows) return;

				return list(rows, function (row, index) {
					return tr(list(row, function (cell, innerIndex) {
						// if total
						if (index === (rows.length - 1)) {
							if (innerIndex === 0) {
								return td({ class: 'statistics-table-number', colspan: 2 }, cell);
							}
						}
						return td({ class: 'statistics-table-number' }, cell);
					}
						));
				});
			})
		)
	);
};

exports['statistics-main'] = function () {
	var queryHandler, data = new ObservableValue(), handlerConf, params;

	handlerConf = queryHandlerConf.slice(0);
	queryHandler = setupQueryHandler(handlerConf,
		location, '/files/certificates-issued/');

	params = queryHandler._handlers.map(function (handler) {
		return handler.name;
	});

	queryHandler.on('query', function (query) {
		var serverQuery = copy(query);
		if (serverQuery.dateFrom) {
			serverQuery.dateFrom = serverQuery.dateFrom.toJSON();
		}
		if (serverQuery.dateTo) {
			serverQuery.dateTo = serverQuery.dateTo.toJSON();
		}
		queryServer(serverQuery).done(function (serverData) {
			data.value = serverData;
		});
	});

	div({ class: 'block-pull-up' },
		form({ action: '/files/certificates-issued/', autoSubmit: true },
			section({ class: 'date-period-selector-positioned-on-submenu' }, dateFromToBlock()),
			section({ class: 'section-primary users-table-filter-bar display-flex flex-wrap' },
				div(
					div(
						a({
							class: 'users-table-filter-bar-print',
							href: getDynamicUrl('/certificates-issued.pdf', { only: params }),
							target: '_blank'
						}, span({ class: 'fa fa-print' }), " ", _("Print pdf"))
					),
					div(
						a({
							class: 'users-table-filter-bar-print',
							href: getDynamicUrl('/certificates-issued.csv', { only: params }),
							target: '_blank'
						}, span({ class: 'fa fa-print' }), " ", _("Print csv"))
					)
				),
				p({ class: 'submit' }, input({ type: 'submit' })))),
		br(),
		section({ class: "section-primary" },
			h3(_("Certificates issued")),
			getTablesFromData(data)));
};
