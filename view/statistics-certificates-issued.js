'use strict';

var _                 = require('mano').i18n.bind('View: Statistics')
  , location          = require('mano/lib/client/location')
  , queryHandlerConf  = require('../apps/statistics/flow-query-conf')
  , setupQueryHandler = require('../utils/setup-client-query-handler')
  , copy              = require('es5-ext/object/copy')
  , ObservableValue   = require('observable-value')
  , queryServer       = require('./utils/statistics-certificates-issued-query-server')
  , getDynamicUrl     = require('./utils/get-dynamic-url')
  , dateFromToBlock   = require('./components/filter-bar/select-date-range-safe-fallback');

exports._parent        = require('./statistics-files');
exports._customFilters = Function.prototype;

exports['files-nav']                = { class: { 'submitted-menu-item-active': true } };
exports['certificates-issued-nav'] = { class: { 'pills-nav-active': true } };

var getTablesFromData = function (certData) {
	return list(certData, function (item) {
		return [
			section({ class: 'section-primary' },
				h3(item.header),
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

exports['statistics-main'] = function () {
	var queryHandler, data = new ObservableValue([]), handlerConf, params;

	handlerConf = queryHandlerConf.slice(0);
	queryHandler = setupQueryHandler(handlerConf,
		location, '/files/certificates-issued/');

	params = queryHandler._handlers.map(function (handler) {
		return handler.name;
	});

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

	div({ class: 'block-pull-up' },
		form({ action: '/files/certificates-issued/', autoSubmit: true },
			section({ class: 'date-period-selector-positioned-on-submenu' }, dateFromToBlock()),
			section({ class: 'section-primary users-table-filter-bar display-flex flex-wrap' },
				div(
					div(
						a({
							class: 'users-table-filter-bar-print',
							href: getDynamicUrl('/certificates-issued.pdf', { only: params }),
							target: '_blank'
						}, span({ class: 'fa fa-print' }), " ", _("Print pdf"))
					),
					div(
						a({
							class: 'users-table-filter-bar-print',
							href: getDynamicUrl('/certificates-issued.csv', { only: params }),
							target: '_blank'
						}, span({ class: 'fa fa-print' }), " ", _("Print csv"))
					)
				),
				p({ class: 'submit' }, input({ type: 'submit' })))),
		br(),
		getTablesFromData(data));
};
