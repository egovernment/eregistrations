'use strict';

var location             = require('mano/lib/client/location')
  , _                    = require('mano').i18n.bind('View: Statistics')
  , db                   = require('mano').db
  , capitalize           = require('es5-ext/string/#/capitalize')
  , uncapitalize         = require('es5-ext/string/#/uncapitalize')
  , ObservableValue      = require('observable-value')
  , setupQueryHandler    = require('../utils/setup-client-query-handler')
  , resolveFullStepPath  = require('../utils/resolve-processing-step-full-path')
  , getData              = require('mano/lib/client/xhr-driver').get
  , getQueryHandlerConf  = require('../routes/utils/get-statistics-time-query-handler-conf')
  , getDurationDaysHours = require('./utils/get-duration-days-hours')
  , getDynamicUrl        = require('./utils/get-dynamic-url')
  , memoize              = require('memoizee');

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

exports['statistics-main'] = function () {
	var processingStepsMeta = this.processingStepsMeta, stepsMap = {}, stepTotals = {}, queryHandler
	  , params;
	Object.keys(processingStepsMeta).forEach(function (stepShortPath) {
		stepsMap[stepShortPath]   = new ObservableValue();
		stepTotals[stepShortPath] = new ObservableValue();
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
				var total;
				stepsMap[key].value = result.byProcessor[key];
				if (!result.byProcessor[key] || !result.byProcessor[key].length) {
					stepTotals[key].value = null;
					return;
				}
				total = {
					processed: 0,
					avgTime: 0,
					minTime: Infinity,
					maxTime: 0,
					totalTime: 0
				};
				result.byProcessor[key].forEach(function (byProcessor) {
					total.processed += byProcessor.processed;
					total.totalTime += byProcessor.totalTime;
					total.minTime = Math.min(byProcessor.minTime, total.minTime);
					total.maxTime = Math.max(byProcessor.maxTime, total.maxTime);
				});
				total.avgTime = total.totalTime / total.processed;
				stepTotals[key].value = total;
			});
		}).done();
	});
	section({ class: 'section-primary users-table-filter-bar' },
		form({ action: '/time/per-person', autoSubmit: true },
			div({ class: 'users-table-filter-bar-status' },
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
					}, null)),
				exports._customFilters.call(this),
				label({ for: 'date-from-input' }, _("Date from"), ":"),
				input({ id: 'date-from-input', type: 'date',
					name: 'dateFrom', value: location.query.get('dateFrom') }),
				label({ for: 'date-to-input' }, _("Date to"), ":"),
				input({ id: 'date-to-input', type: 'date',
					name: 'dateTo', value: location.query.get('dateTo') }),
				a({ class: 'button-resource-link', href:
					getDynamicUrl('/get-time-per-person-print/', params),
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
				table(
					thead(
						th(),
						th(_("Files processed")),
						th(_("Average time")),
						th(_("Min time")),
						th(_("Max time"))
					),
					tbody({ onEmpty: tr(td({ class: 'empty', colspan: 5 },
						_("There are no files processed at this step"))) }, list(data, function (rowData) {
						tr(
							td(db.User.getById(rowData.processor).fullName),
							td(rowData.processed),
							td(getDurationDaysHours(rowData.avgTime)),
							td(getDurationDaysHours(rowData.minTime)),
							td(getDurationDaysHours(rowData.maxTime))
						);
					}), stepTotals[shortStepPath].map(function (totals) {
						if (!totals) return;
						return tr(
							td(_("Total & times")),
							td(totals.processed),
							td(getDurationDaysHours(totals.avgTime)),
							td(getDurationDaysHours(totals.minTime)),
							td(getDurationDaysHours(totals.maxTime))
						);
					}))
				));
		});
	}));
};
