'use strict';

var location             = require('mano/lib/client/location')
  , _                    = require('mano').i18n.bind('View: Statistics')
  , db                   = require('mano').db
  , ObservableValue      = require('observable-value')
  , setupQueryHandler    = require('../../utils/setup-client-query-handler')
  , getData              = require('mano/lib/client/xhr-driver').get
  , getQueryHandlerConf  = require('../../routes/utils/get-statistics-time-query-handler-conf')
  , getDurationDaysHours = require('../utils/get-duration-days-hours')
  , getDynamicFormAction = require('../utils/get-dynamic-form-action')
  , memoize              = require('memoizee');

var queryServer = memoize(function (query) {
	return getData('/get-processing-time-data/', query);
}, {
	normalizer: function (args) { return JSON.stringify(args[0]); }
});

var renderedProps = ['processed', 'avgTime', 'minTime', 'maxTime', 'totalAvgTime'];

var mapDurationValue = function (value) {
	if (!value || value === '-') return '-';
	return getDurationDaysHours(value);
};

module.exports = function (context) {
	var data = {}, queryHandler, formAction;
	queryHandler = setupQueryHandler(getQueryHandlerConf({
		db: db
	}), location, '/');

	renderedProps.forEach(function (prop) {
		data[prop] = new ObservableValue();
	});
	formAction = getDynamicFormAction('/', ['dateFrom', 'dateTo']);

	queryHandler.on('query', function (query) {
		if (query.dateFrom) {
			query.dateFrom = query.dateFrom.toJSON();
		}
		if (query.dateTo) {
			query.dateTo = query.dateTo.toJSON();
		}
		queryServer(query)(function (result) {
			renderedProps.forEach(function (prop) {
				data[prop].value = null;
			});
			if (!result || !result.stepTotal) return;
			renderedProps.forEach(function (prop) {
				if (result.processor && result.processor[prop]) {
					data[prop].value = result.processor[prop];
				}
				if (prop === 'totalAvgTime') {
					data.totalAvgTime.value = result.stepTotal.avgTime;
				}
			});
		}).done();
	}, this);
	return [section({ class: 'section-primary users-table-filter-bar' },
		form({ action: formAction, autoSubmit: true },
			div({ class: 'users-table-filter-bar-status' },
				label({ for: 'date-from-input' }, _("Statistics date from"), ":"),
				input({ id: 'date-from-input', type: 'date',
					name: 'dateFrom', value: location.query.get('dateFrom') }),
				label({ for: 'date-to-input' }, _("Statistics date to"), ":"),
				input({ id: 'date-to-input', type: 'date',
					name: 'dateTo', value: location.query.get('dateTo') })))),
		section({ class: 'table-responsive-container' },
			table({ class: 'statistics-table statistics-table-officials' },
				thead(
					tr(
						th(_("Files processed")),
						th(_("Min time")),
						th(_("Max time")),
						th(_("Average time")),
						th(_("Overall processors average time"))
					)
				),
				tbody(
					tr(
						td(data.processed.map(function (value) {
							if (!value) return '-';
							return value;
						})),
						td(data.minTime.map(mapDurationValue)),
						td(data.maxTime.map(mapDurationValue)),
						td(data.avgTime.map(mapDurationValue)),
						td(data.totalAvgTime.map(mapDurationValue))
					)
				)
				))];
};
