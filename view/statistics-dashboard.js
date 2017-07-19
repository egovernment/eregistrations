'use strict';

var _                 = require('mano').i18n.bind('View: Statistics')
  , memoize           = require('memoizee')
  , location          = require('mano/lib/client/location')
  , queryHandlerConf  = require('../apps/statistics/flow-query-conf')
  , setupQueryHandler = require('../utils/setup-client-query-handler')
  , getData           = require('mano/lib/client/xhr-driver').get
  , copy              = require('es5-ext/object/copy')
  , ObservableValue   = require('observable-value')
  , dateFromToBlock   = require('./components/filter-bar/select-date-range-safe-fallback');

var queryServer = memoize(function (query) {
	return getData('/get-dashboard-data/', query);
}, {
	normalizer: function (args) { return JSON.stringify(args[0]); },
	max: 1000
});

exports._parent = require('./user-base');

exports['dashboard-nav'] = { class: { 'submitted-menu-item-active': true } };

var getTablesFromData = function (certData) {
	return list(certData, function (item) {
		return [
			section({ class: 'section-secondary' },
				h4(item.header),
				table(
					{ class: 'statistics-table statistics-table-registrations' },
					thead(
						th({ class: 'statistics-table-header-waiting' }, _("Category")),
						th({ class: 'statistics-table-header-waiting' }, _("Certificate")),
						th({ class: 'statistics-table-header-waiting' }, _("Number of issued"))
					),
					tbody(
						list(item.data, function (row) {
							if (!row) return;

							return tr(list(row, function (cell) {
								return td({ class: 'statistics-table-number' }, cell);
							}));
						})
					)
				)),
			br()
		];
	});
};

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		var queryHandler, data = new ObservableValue([]), handlerConf;

		handlerConf = queryHandlerConf.slice(0);
		queryHandler = setupQueryHandler(handlerConf,
			location, '/');

		queryHandler.on('query', function (query) {
			var serverQuery = copy(query);
			if (serverQuery.dateFrom) {
				serverQuery.dateFrom = serverQuery.dateFrom.toJSON();
			}
			if (serverQuery.dateTo) {
				serverQuery.dateTo = serverQuery.dateTo.toJSON();
			}
			queryServer(serverQuery).done(function (serverData) {
				data.value = serverData;
			});
		});

		section({ class: 'first-out-of-section-element date-period-selector-out-of-section-block' },
			form({ action: '/', autoSubmit: true },
				dateFromToBlock(),
				p({ class: 'submit' }, input({ type: 'submit' }))));

		section({ class: "section-primary" },
			h3(_("Certficates issued")),
			getTablesFromData(data));
	}
};
