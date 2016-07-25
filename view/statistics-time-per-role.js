'use strict';

var location             = require('mano/lib/client/location')
  , _                    = require('mano').i18n.bind('View: Statistics')
  , db                   = require('mano').db
  , capitalize           = require('es5-ext/string/#/capitalize')
  , uncapitalize         = require('es5-ext/string/#/uncapitalize')
  , ObservableArray      = require('observable-array')
  , setupQueryHandler    = require('../utils/setup-client-query-handler')
  , resolveFullStepPath  = require('../utils/resolve-processing-step-full-path')
  , getData              = require('mano/lib/client/xhr-driver').get
  , getQueryHandlerConf  = require('../routes/utils/get-statistics-time-query-handler-conf')
  , getDurationDaysHours = require('./utils/get-duration-days-hours')
  , memoize              = require('memoizee');

exports._parent = require('./statistics-time');
exports._customFilters = Function.prototype;

exports['time-nav'] = { class: { 'pills-nav-active': true } };
exports['per-role-nav'] = { class: { 'pills-nav-active': true } };

var queryServer = memoize(function (query) {
	return getData('/get-processing-time-data/', query);
}, {
	normalizer: function (args) { return JSON.stringify(args[0]); }
});

var getEmptyResult = function () {
	return {
		processed: 0,
		label: 'Label',
		avgTime: 0,
		minTime: Infinity,
		maxTime: 0,
		totalTime: 0
	};
};

var resetResult = function (result) {
	result.processed = '-';
	result.avgTime = '-';
	result.minTime = '-';
	result.maxTime = '-';
	result.totalTime = '-';
};

exports['statistics-main'] = function () {
	var processingStepsMeta = this.processingStepsMeta, mainData, queryHandler;
	mainData = new ObservableArray();
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
			var totalWithoutCorrections, perRoleTotal;
			mainData.splice(0, mainData.length);
			totalWithoutCorrections = getEmptyResult();
			totalWithoutCorrections.label = _("Total process without corrections");
			Object.keys(result).forEach(function (key) {
				perRoleTotal = getEmptyResult();
				perRoleTotal.label   = db['BusinessProcess' +
					capitalize.call(processingStepsMeta[key]._services[0])].prototype
					.processingSteps.map.getBySKeyPath(resolveFullStepPath(key)).label;

				if (!result[key].length) {
					resetResult(perRoleTotal);

					mainData.push(perRoleTotal);
					return;
				}
				result[key].forEach(function (byProcessor) {
					perRoleTotal.processed += byProcessor.processed;
					perRoleTotal.minTime = Math.min(byProcessor.minTime, perRoleTotal.minTime);
					perRoleTotal.maxTime = Math.max(byProcessor.maxTime, perRoleTotal.maxTime);
					perRoleTotal.totalTime += byProcessor.totalTime;
				});
				perRoleTotal.avgTime = perRoleTotal.totalTime / perRoleTotal.processed;

				mainData.push(perRoleTotal);

				totalWithoutCorrections.processed += perRoleTotal.processed;
				totalWithoutCorrections.minTime =
					Math.min(perRoleTotal.minTime, totalWithoutCorrections.minTime);
				totalWithoutCorrections.maxTime =
					Math.max(perRoleTotal.maxTime, totalWithoutCorrections.maxTime);
				totalWithoutCorrections.totalTime += perRoleTotal.totalTime;
			});

			if (!totalWithoutCorrections.processed) {
				resetResult(totalWithoutCorrections);
			} else {
				totalWithoutCorrections.avgTime =
					totalWithoutCorrections.totalTime / totalWithoutCorrections.processed;
			}

			mainData.push(totalWithoutCorrections);
		}).done();
	});

	section({ class: 'section-primary users-table-filter-bar' },
		form({ action: '/time', autoSubmit: true },
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
					_("There is no data to display"))) },
				mainData, function (row) {
				return tr(
					td(row.label),
					td(row.processed),
					td(Number(row.avgTime) ? getDurationDaysHours(row.avgTime) : row.avgTime),
					td(Number(row.minTime) ? getDurationDaysHours(row.minTime) : row.minTime),
					td(Number(row.maxTime) ? getDurationDaysHours(row.maxTime) : row.maxTime)
				);
			})));
};
