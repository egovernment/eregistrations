'use strict';

var copy                 = require('es5-ext/object/copy')
  , forEach              = require('es5-ext/object/for-each')
  , capitalize           = require('es5-ext/string/#/capitalize')
  , uncapitalize         = require('es5-ext/string/#/uncapitalize')
  , memoize              = require('memoizee')
  , ObservableValue      = require('observable-value')
  , location             = require('mano/lib/client/location')
  , _                    = require('mano').i18n.bind('View: Statistics')
  , db                   = require('mano').db
  , getData              = require('mano/lib/client/xhr-driver').get
  , setupQueryHandler    = require('../utils/setup-client-query-handler')
  , resolveFullStepPath  = require('../utils/resolve-processing-step-full-path')
  , getQueryHandlerConf  = require('../apps/statistics/get-query-conf')
  , getDurationDaysHours = require('./utils/get-duration-days-hours-fine-grain')
  , dateFromToBlock      = require('./components/filter-bar/select-date-range-safe-fallback')
  , getDynamicUrl        = require('./utils/get-dynamic-url')
  , statisticsTimeRowOnClick        = require('./utils/statistics-time-row-onclick')
  , processingStepsMetaWithoutFrontDesk
	= require('./utils/processing-steps-meta-without-front-desk');

exports._parent        = require('./statistics-time');
exports._customFilters = Function.prototype;

exports['time-nav']       = { class: { 'submitted-menu-item-active': true } };
exports['per-person-nav'] = { class: { 'pills-nav-active': true } };

var queryServer = memoize(function (query) {
	return getData('/get-time-per-person/', query);
}, {
	normalizer: function (args) { return JSON.stringify(args[0]); }
});

var getRowResult = function (rowData, label) {
	var result     = copy(rowData);
	result.label   = label;
	result.avgTime = rowData.timedCount ? getDurationDaysHours(rowData.avgTime) : '-';
	result.minTime = rowData.timedCount ? getDurationDaysHours(rowData.minTime) : '-';
	result.maxTime = rowData.timedCount ? getDurationDaysHours(rowData.maxTime) : '-';

	return result;
};

exports['statistics-main'] = function () {
	var stepsMeta = processingStepsMetaWithoutFrontDesk(),
		stepsMap = {}, queryHandler, params, queryResult;
	Object.keys(stepsMeta).forEach(function (stepShortPath) {
		stepsMap[stepShortPath]   = new ObservableValue();
	});
	queryHandler = setupQueryHandler(getQueryHandlerConf({
		processingStepsMeta: stepsMeta
	}), location, '/time/per-person/');
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
		queryServer(query).done(function (result) {
			queryResult = result;
			Object.keys(stepsMap).forEach(function (key) {
				var preparedResults = [];
				if (!result.byStep[key]) {
					stepsMap[key].value = null;
					return;
				}
				forEach(result.byStepAndProcessor[key], function (rowData, userId) {
					var preparedResult = getRowResult(rowData.processing,
						db.User.getById(userId).fullName);
					preparedResult.key = key;
					preparedResult.userId = userId;
					preparedResults.push(preparedResult);
				});
				preparedResults.push(getRowResult(result.byStep[key].processing, _("Total & times")));
				stepsMap[key].value = preparedResults;
			});
		});
	});

	div({ class: 'block-pull-up' },
		form({ action: '/time/per-person', autoSubmit: true },
			section({ class: 'date-period-selector-positioned-on-submenu' },
				dateFromToBlock()),
			section({ class: 'entities-overview-info' },
				_("As processing time is properly recorded since 25th of October." +
					" Below table only exposes data for files submitted after that day.")),
			br(),
			section({ class: 'section-primary users-table-filter-bar' },
				div(
					{ class: 'users-table-filter-bar-status' },
					label({ for: 'service-select' }, _("Service"), ":"),
					select({ id: 'service-select', name: 'service' },
						option({
							value: '',
							selected: location.query.get('service').map(function (value) {
								return (value == null);
							})
						}, _("All")),
						list(db.BusinessProcess.extensions, function (service) {
							var serviceName = uncapitalize.call(service.__id__.slice('BusinessProcess'.length));
							return option({
								value: serviceName,
								selected: location.query.get('service').map(function (value) {
									var selected = (serviceName ? (value === serviceName) : (value == null));
									return selected ? 'selected' : null;
								})
							}, service.prototype.label);
						}, null))
				),
				div(
					{ class: 'users-table-filter-bar-status' },
					exports._customFilters.call(this)
				),
				div(
					a({
						class: 'users-table-filter-bar-print',
						href: getDynamicUrl('/time-per-person.pdf', { only: params }),
						target: '_blank'
					}, span({ class: 'fa fa-print' }), " ", _("Print pdf"))
				))),
		br(),
		insert(list(Object.keys(stepsMap), function (shortStepPath) {
			return stepsMap[shortStepPath].map(function (data) {
				if (!data) return;
				var step = db['BusinessProcess' +
					capitalize.call(stepsMeta[shortStepPath]._services[0])]
					.prototype
					.processingSteps.map.getBySKeyPath(resolveFullStepPath(shortStepPath));
				return [section({ class: "section-primary" },
					h3(step.label),
					table({ class: 'statistics-table' },
						thead(
							th(),
							th({ class: 'statistics-table-number' }, _("Files processed")),
							th({ class: 'statistics-table-number' }, _("Average time")),
							th({ class: 'statistics-table-number' }, _("Min time")),
							th({ class: 'statistics-table-number' }, _("Max time"))
						),
						tbody({
							onEmpty: tr(td({ class: 'empty statistics-table-number', colspan: 5 },
								_("There are no files processed at this step")))
						}, data, function (rowData) {

							var step, props = {};

							if (rowData && rowData.key && rowData.userId) {
								step = queryResult.byStepAndProcessor[rowData.key][rowData.userId];
							}

							if (step && step.businessProcesses.length !== 0) {
								props.class = 'cursor-pointer text-decoration-underline';
								props.onclick = function () {
									statisticsTimeRowOnClick(window.jQuery(this), step.businessProcesses);
								};
							}

							return tr(props,
								td(rowData.label),
								td({ class: 'statistics-table-number' }, rowData.timedCount),
								td({ class: 'statistics-table-number' }, rowData.avgTime),
								td({ class: 'statistics-table-number' }, rowData.minTime),
								td({ class: 'statistics-table-number' }, rowData.maxTime)
								);
						})
						)), br()];
			});
		})));
};
