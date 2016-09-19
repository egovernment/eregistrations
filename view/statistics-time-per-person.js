'use strict';

var copy                 = require('es5-ext/object/copy')
  , forEach              = require('es5-ext/object/for-each')
  , isEmpty              = require('es5-ext/object/is-empty')
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
  , getQueryHandlerConf  = require('../routes/utils/get-statistics-time-query-handler-conf')
  , getDurationDaysHours = require('./utils/get-duration-days-hours')
  , getDynamicUrl        = require('./utils/get-dynamic-url');

exports._parent        = require('./statistics-time');
exports._customFilters = Function.prototype;
exports._queryConf     = null;

exports['time-nav'] = { class: { 'pills-nav-active': true } };
exports['per-person-nav'] = { class: { 'pills-nav-active': true } };

var queryServer = memoize(function (query) {
	return getData('/get-processing-time-data/', query);
}, {
	normalizer: function (args) { return JSON.stringify(args[0]); }
});

var getRowResult = function (rowData, label) {
	var result     = copy(rowData);
	result.label   = label;
	result.avgTime = rowData.avgTime ? getDurationDaysHours(rowData.avgTime) : '-';
	result.minTime = rowData.minTime ? getDurationDaysHours(rowData.minTime) : '-';
	result.maxTime = rowData.maxTime ? getDurationDaysHours(rowData.maxTime) : '-';

	return result;
};

exports['statistics-main'] = function () {
	var processingStepsMeta = this.processingStepsMeta, stepsMap = {}, queryHandler
	  , params;
	Object.keys(processingStepsMeta).forEach(function (stepShortPath) {
		stepsMap[stepShortPath]   = new ObservableValue();
	});
	queryHandler = setupQueryHandler(getQueryHandlerConf({
		db: db,
		processingStepsMeta: processingStepsMeta,
		queryConf: exports._queryConf
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
		queryServer(query)(function (result) {
			Object.keys(stepsMap).forEach(function (key) {
				var preparedResult = [];
				if (!result.byStepAndProcessor[key]) {
					stepsMap[key].value = null;
					return;
				}
				if (!isEmpty(result.byStepAndProcessor[key])) {
					forEach(result.byStepAndProcessor[key], function (rowData) {
						preparedResult.push(getRowResult(rowData, db.User.getById(rowData.processor).fullName));
					});
					preparedResult.push(getRowResult(result.byStep[key], _("Total & times")));
				}
				stepsMap[key].value = preparedResult;
			});
		}).done();
	});
	section({ class: 'section-primary users-table-filter-bar' },
		form({ action: '/time/per-person', autoSubmit: true },
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
			),
			div(
				a({ class: 'users-table-filter-bar-print', href:
					getDynamicUrl('/get-time-per-person-print/', { only: params }),
					target: '_blank' }, span({ class: 'fa fa-print' }), " ", _("Print pdf"))
			)));
	insert(list(Object.keys(stepsMap), function (shortStepPath) {
		return stepsMap[shortStepPath].map(function (data) {
			if (!data) return;
			var step = db['BusinessProcess' +
				capitalize.call(processingStepsMeta[shortStepPath]._services[0])].prototype
				.processingSteps.map.getBySKeyPath(resolveFullStepPath(shortStepPath));
			return section({ class: "section-primary" },
				h3(step.label),
				table({ class: 'statistics-table' },
					thead(
						th(),
						th({ class: 'statistics-table-number' }, _("Files processed")),
						th({ class: 'statistics-table-number' }, _("Average time")),
						th({ class: 'statistics-table-number' }, _("Min time")),
						th({ class: 'statistics-table-number' }, _("Max time"))
					),
					tbody({ onEmpty: tr(td({ class: 'empty statistics-table-number', colspan: 5 },
						_("There are no files processed at this step"))) }, data, function (rowData) {
						return tr(
							td(rowData.label),
							td({ class: 'statistics-table-number' }, rowData.processed),
							td({ class: 'statistics-table-number' }, rowData.avgTime),
							td({ class: 'statistics-table-number' }, rowData.minTime),
							td({ class: 'statistics-table-number' }, rowData.maxTime)
						);
					})
					));
		});
	}));
};
