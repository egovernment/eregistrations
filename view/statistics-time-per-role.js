'use strict';

var location            = require('mano/lib/client/location')
  , _                   = require('mano').i18n.bind('View: Statistics')
  , db                  = require('mano').db
  , capitalize          = require('es5-ext/string/#/capitalize')
  , uncapitalize        = require('es5-ext/string/#/uncapitalize')
  , ObservableValue     = require('observable-value')
  , setupQueryHandler   = require('../utils/setup-client-query-handler')
  , resolveFullStepPath = require('../utils/resolve-processing-step-full-path')
  , getData             = require('mano/lib/client/xhr-driver').get
  , getQueryHandlerConf = require('../routes/utils/get-statistics-time-query-handler-conf');

exports._parent = require('./statistics-time');

exports['time-nav'] = { class: { 'pills-nav-active': true } };
exports['per-role-nav'] = { class: { 'pills-nav-active': true } };

exports['statistics-main'] = function () {
	var processingStepsMeta = this.processingStepsMeta, stepsMap = {}, queryHandler;
	Object.keys(processingStepsMeta).forEach(function (stepShortPath) {
		stepsMap[stepShortPath] = new ObservableValue();
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
		getData('/get-processing-time-data/', query)(function (result) {
			Object.keys(stepsMap).forEach(function (key) {
				stepsMap[key].value = result[key];
			});
		});
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
				label({ for: 'date-from-input' }, _("Date from"), ":"),
				input({ id: 'date-from-input', type: 'date',
					name: 'dateFrom', value: location.query.get('dateFrom') }),
				label({ for: 'date-to-input' }, _("Date to"), ":"),
				input({ id: 'date-to-input', type: 'date',
					name: 'dateTo', value: location.query.get('dateTo') }))));
	ul(list(Object.keys(stepsMap), function (shortStepPath) {
		return _if(stepsMap[shortStepPath], function () {
			var step = db['BusinessProcess' +
				capitalize.call(processingStepsMeta[shortStepPath]._services[0])].prototype
				.processingSteps.map.getBySKeyPath(resolveFullStepPath(shortStepPath));

			return section({ class: "section-primary" },
				step.label,
				_if(stepsMap[shortStepPath].map(function (data) {
					if (!data) return;
					return data.length;
				}), table(
					thead(
						th(),
						th(_("Files processed")),
						th(_("Average time")),
						th(_("Min time")),
						th(_("Max time"))
					),
					tbody(stepsMap[shortStepPath], function (rowData) {
						tr(
							td(db.User.getById(rowData.processor).fullName),
							td(rowData.processed),
							td(rowData.avgTime),
							td(rowData.minTime),
							td(rowData.maxTime)
						);
					})
				)));
		});
	}));
};
