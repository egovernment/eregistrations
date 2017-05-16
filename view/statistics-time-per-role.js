'use strict';

var uncapitalize         = require('es5-ext/string/#/uncapitalize')
  , memoize              = require('memoizee')
  , ObservableArray      = require('observable-array')
  , location             = require('mano/lib/client/location')
  , _                    = require('mano').i18n.bind('View: Statistics')
  , db                   = require('mano').db
  , getData              = require('mano/lib/client/xhr-driver').get
  , getQueryHandlerConf  = require('../apps/statistics/get-query-conf')
  , setupQueryHandler    = require('../utils/setup-client-query-handler')
  , getDurationDaysHours = require('./utils/get-duration-days-hours-fine-grain')
  , dateFromToBlock      = require('./components/filter-bar/select-date-range-safe-fallback')
  , getDynamicUrl        = require('./utils/get-dynamic-url')
  , initializeRowOnClick = require('./utils/statistics-time-row-onclick')
  , processingStepsMetaWithoutFrontDesk
	= require('./../utils/processing-steps-meta-without-front-desk');

exports._parent = require('./statistics-time');
exports._customFilters = Function.prototype;

exports['time-nav']     = { class: { 'submitted-menu-item-active': true } };
exports['per-role-nav'] = { class: { 'pills-nav-active': true } };

var queryServer = memoize(function (query) {
	return getData('/get-time-per-role/', query);
}, {
	normalizer: function (args) { return JSON.stringify(args[0]); }
});

exports['statistics-main'] = function () {
	var stepsMeta = processingStepsMetaWithoutFrontDesk(),
		mainData, queryHandler, params, queryResult;
	mainData = new ObservableArray();
	queryHandler = setupQueryHandler(getQueryHandlerConf({
		processingStepsMeta: stepsMeta
	}), location, '/time/');
	params = queryHandler._handlers.map(function (handler) {
		return handler.name;
	});

	queryHandler.on('query', function (query) {
		if (query.dateFrom) {
			query.dateFrom = query.dateFrom.toJSON();
		}
		if (query.dateTo) {
			query.dateTo = query.dateTo.toJSON();
		}
		queryServer(query)(function (result) {
			mainData.splice(0, mainData.length);
			queryResult = result;
			Object.keys(queryResult).forEach(function (key) {
				mainData.push(queryResult[key]);
			});
		}).done();
	});

	div({ class: 'block-pull-up' }, form({ action: '/time/', autoSubmit: true },
		section({ class: 'date-period-selector-positioned-on-submenu' },
			dateFromToBlock()),
		section({ class: 'entities-overview-info' },
			_("As processing time is properly recorded since 1st of February 2017." +
				" Below table only exposes data for files submitted after that day.")),
		br(),
		section({ class: 'section-primary users-table-filter-bar' },
			div(
				{ class: 'users-table-filter-bar-status' },
				label({ for: 'service-select' }, _("Service"), ":"),
				select({ id: 'service-select', name: 'service' },
					option(
						{ value: '', selected: location.query.get('service').map(function (value) {
							return (value == null);
						})
							},
						_("All")
					),
					list(db.BusinessProcess.extensions, function (service) {
						var serviceName = uncapitalize.call(service.__id__.slice('BusinessProcess'.length));
						return option({ value: serviceName, selected:
								location.query.get('service').map(function (value) {
								var selected = (serviceName ? (value === serviceName) : (value == null));
								return selected ? 'selected' : null;
							}) },
							service.prototype.label);
					}, null))
			),
			div(
				{ class: 'users-table-filter-bar-status' },
				exports._customFilters.call(this)
			),
			div(
				a({ class: 'users-table-filter-bar-print', href: getDynamicUrl('/time-per-role.csv',
					{ only: params }),
					target: '_blank' }, span({ class: 'fa fa-print' }), " ", _("Print csv"))
			),
			div(
				a({ class: 'users-table-filter-bar-print', href: getDynamicUrl('/time-per-role.pdf',
					{ only: params }),
					target: '_blank' }, span({ class: 'fa fa-print' }), " ", _("Print pdf"))
			))),
		br(),
		div({ class: 'overflow-x table-responsive-container' },
			(table({ class: 'statistics-table submitted-user-data-table' },
				thead(
					tr(
						th(),
						th({ class: 'statistics-table-number' }, _("Processing periods")),
						th({ class: 'statistics-table-number' }, _("Average time")),
						th({ class: 'statistics-table-number' }, _("Min time")),
						th({ class: 'statistics-table-number' }, _("Max time"))
					)
				),
				tbody({
					onEmpty: tr(td({ class: 'empty', colspan: 5 },
							_("There is no data to display")))
				}, mainData, function (row) {
					var props = {}, rowResult;
					rowResult = row.processing || row;
					if (row.processingPeriods && row.processingPeriods.length) {
						initializeRowOnClick(row, props, true);
					}

					return tr(props,
						td(row.label),
						td({ class: 'statistics-table-number' }, rowResult.timedCount),
						td({ class: 'statistics-table-number' },
							rowResult.timedCount ? getDurationDaysHours(rowResult.avgTime) : "-"),
						td({ class: 'statistics-table-number' },
							rowResult.timedCount ? getDurationDaysHours(rowResult.minTime) : "-"),
						td({ class: 'statistics-table-number' },
							rowResult.timedCount ? getDurationDaysHours(rowResult.maxTime) : "-"));
				}))
			)));
};
