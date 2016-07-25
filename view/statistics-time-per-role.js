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
  , memoize              = require('memoizee');

exports._parent = require('./statistics-time');

exports['time-nav'] = { class: { 'pills-nav-active': true } };
exports['per-role-nav'] = { class: { 'pills-nav-active': true } };

var queryServer = memoize(function (query) {
	return getData('/get-processing-time-data/', query);
}, {
	normalizer: function (args) { return JSON.stringify(args[0]); }
});

exports['statistics-main'] = function () {
	var processingStepsMeta = this.processingStepsMeta, stepsMap = {}, stepTotals = {}, queryHandler;
	Object.keys(processingStepsMeta).forEach(function (stepShortPath) {
		stepsMap[stepShortPath]   = new ObservableValue();
		stepTotals[stepShortPath] = new ObservableValue();
	});
	queryHandler = setupQueryHandler(getQueryHandlerConf({
		db: db,
		processingStepsMeta: processingStepsMeta
	}), location, '/time/');

	queryHandler.on('query', function (query) {
		if (query.dateFrom) {
			query.dateFrom = query.dateFrom.toJSON();
		}
		if (query.dateTo) {
			query.dateTo = query.dateTo.toJSON();
		}
		queryServer(query)(function (result) {
			Object.keys(stepsMap).forEach(function (key) {
				stepsMap[key].value = result[key];
				if (!result[key] || !result[key].length) {
					stepTotals[key].value = null;
				}
			});
		});
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
				a({ class: 'button-resource-link', href: '#',
					target: '_blank' }, span({ class: 'fa fa-print' }), " ", _("Print pdf"))
				)));
	section({ class: 'section-primary' },
		table(thead(
			th(),
			th(_("Files processed")),
			th(_("Average time")),
			th(_("Min time")),
			th(_("Max time"))
		), tbody({ onEmpty: tr(td({ class: 'empty', colspan: 5 },
			_("There are no files processed at this step"))) },
			Object.keys(stepsMap), function (shortStepPath) {
				return stepsMap[shortStepPath].map(function (data) {
					if (!data) return;
					var step = db['BusinessProcess' +
						capitalize.call(processingStepsMeta[shortStepPath]._services[0])].prototype
						.processingSteps.map.getBySKeyPath(resolveFullStepPath(shortStepPath)), perRoleTotal;
					perRoleTotal = {
						processed: 0,
						avgTime: 0,
						minTime: Infinity,
						maxTime: 0,
						totalTime: 0
					};
					data.forEach(function (byProcessor) {
						perRoleTotal.processed++;
						perRoleTotal.minTime = Math.min(byProcessor.minTime, perRoleTotal.minTime);
						perRoleTotal.maxTime = Math.max(byProcessor.maxTime, perRoleTotal.maxTime);
						perRoleTotal.totalTime += byProcessor.totalTime;
					});
					perRoleTotal.avgTime = perRoleTotal.totalTime / perRoleTotal.processed;
					return tr(
						td(step.label),
						td(perRoleTotal.processed),
						td(getDurationDaysHours(perRoleTotal.avgTime)),
						td(getDurationDaysHours(perRoleTotal.minTime)),
						td(getDurationDaysHours(perRoleTotal.maxTime))
					);
				});
			}))
		);
};
