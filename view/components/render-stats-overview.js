'use strict';

var location             = require('mano/lib/client/location')
  , _                    = require('mano').i18n.bind('View: Statistics')
  , ObservableValue      = require('observable-value')
  , setupQueryHandler    = require('../../utils/setup-client-query-handler')
  , getData              = require('mano/lib/client/xhr-driver').get
  , getQueryHandlerConf  = require('../../apps/statistics/get-query-conf')
  , getDurationDaysHours = require('../utils/get-duration-days-hours-fine-grain')
  , getDynamicUrl        = require('../utils/get-dynamic-url')
  , dateFromToBlock      =
	require('eregistrations/view/components/filter-bar/select-date-range-safe-fallback')
  , memoize              = require('memoizee');

var queryServer = memoize(function (query) {
	return getData('/get-processing-time-data/', query);
}, {
	normalizer: function (args) { return JSON.stringify(args[0]); }
});

var renderedProps = ['timedCount', 'avgTime', 'minTime', 'maxTime', 'totalAvgTime'];

var mapDurationValue = function (value) {
	if (!value || value === '-') return '-';
	return getDurationDaysHours(value);
};

module.exports = function (context) {
	var data = {}, queryHandler, formAction, user;
	queryHandler = setupQueryHandler(getQueryHandlerConf(), location, '/');
	user = context.user;

	renderedProps.forEach(function (prop) {
		data[prop] = new ObservableValue();
	});
	formAction = getDynamicUrl('/', { filter: ['dateFrom', 'dateTo'] });

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
			if (!result || !result.rows.totalProcessing || !result.rows.totalProcessing.avgTime) return;
			renderedProps.forEach(function (prop) {
				if (result.rows[user.__id__] && result.rows[user.__id__].processing[prop]) {
					data[prop].value = result.rows[user.__id__].processing[prop];
				}
				if (prop === 'totalAvgTime') {
					data.totalAvgTime.value = result.rows.totalProcessing.avgTime;
				}
			});
		}).done();
	}, this);
	return [section({ class: 'first-out-of-section-element ' +
		'date-period-selector-out-of-section-block' },
		form({ action: formAction, autoSubmit: true },
			dateFromToBlock())),
		section({ class: 'table-responsive-container' },
			table({ class: 'statistics-table statistics-table-officials' },
				thead(
					tr(
						th(_("Processing periods")),
						th(_("Min time")),
						th(_("Max time")),
						th(_("Average time")),
						th(_("Overall processors average time"))
					)
				),
				tbody(
					tr(td({ colspan: 5 },
						_("As processing time is properly recorded since 1st of February 2017. " +
							"Below table only exposes data for files submitted after that day."))),
					tr(
						td(data.timedCount.map(function (value) {
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
