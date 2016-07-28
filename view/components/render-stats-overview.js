'use strict';

var location             = require('mano/lib/client/location')
  , _                    = require('mano').i18n.bind('View: Statistics')
  , db                   = require('mano').db
  , ObservableValue      = require('observable-value')
  , setupQueryHandler    = require('../../utils/setup-client-query-handler')
  , getData              = require('mano/lib/client/xhr-driver').get
  , getQueryHandlerConf  = require('../../routes/utils/get-statistics-time-query-handler-conf')
  , getDurationDaysHours = require('../utils/get-duration-days-hours')
  , memoize              = require('memoizee');

var queryServer = memoize(function (query) {
	return getData('/get-processing-time-data/', query);
}, {
	normalizer: function (args) { return JSON.stringify(args[0]); }
});

module.exports = function (context) {
	var data, queryHandler;
	queryHandler = setupQueryHandler(getQueryHandlerConf({
		db: db
	}), location, '/');

	data = new ObservableValue();

	queryHandler.on('query', function (query) {
		if (query.dateFrom) {
			query.dateFrom = query.dateFrom.toJSON();
		}
		if (query.dateTo) {
			query.dateTo = query.dateTo.toJSON();
		}
		queryServer(query)(function (result) {
			var totalOfAll;
			data.value = result.byProcessor[context.processingStep.key][this.user.__id__] || {
				processed: '-',
				avgTime: '-',
				minTime: '-',
				max: '-'
			};

			totalOfAll = { processed: 0, totalTime: 0 };
			result.byProcessor[context.processingStep.key].forEach(function (byProcessor) {
				totalOfAll.processed += byProcessor.processed;
				totalOfAll.totalTime += byProcessor.totalTime;
			});
			if (!totalOfAll.processed) {
				data.value.totalAvgTime = '-';
			} else {
				data.value.totalAvgTime = totalOfAll.totalTime / totalOfAll.processed;
			}
		}).done();
	}, this);
	return section({ class: 'section-primary users-table-filter-bar' },
		form({ action: '/time/per-person', autoSubmit: true },
			div({ class: 'users-table-filter-bar-status' },
				label({ for: 'date-from-input' }, _("Date from"), ":"),
				input({ id: 'date-from-input', type: 'date',
					name: 'dateFrom', value: location.query.get('dateFrom') }),
				label({ for: 'date-to-input' }, _("Date to"), ":"),
				input({ id: 'date-to-input', type: 'date',
					name: 'dateTo', value: location.query.get('dateTo') }))),
		table(
			thead(
				th(_("Files processed")),
				th(_("Min time")),
				th(_("Max time")),
				th(_("Average time")),
				th(_("Overall processors average time"))
			),
			tbody({ onEmpty: tr(td({ class: 'empty', colspan: 6 },
				_("There are no files processed at this step"))) },
				tr(
					td(data.processed),
					td(getDurationDaysHours(data.avgTime)),
					td(getDurationDaysHours(data.minTime)),
					td(getDurationDaysHours(data.maxTime)),
					td(getDurationDaysHours(data.totalAvgTime))
				))
		));
};
