'use strict';

var _                            = require('mano').i18n.bind('View: Statistics')
  , db                = require('../db')
  , location          = require('mano/lib/client/location')
  , queryHandlerConf  = require('../apps/statistics/flow-query-operators-conf')
  , setupQueryHandler = require('../utils/setup-client-query-handler')
  , copy              = require('es5-ext/object/copy')
  , ObservableValue   = require('observable-value')
  , Pagination        = require('./components/pagination')
  , selectService     = require('./components/filter-bar/select-service')
  , selectRejectionReason = require('./components/filter-bar/select-rejection-reason')
  , queryServer       = require('./utils/statistics-rejections-query-server')
  , dateFromToBlock    = require('./components/filter-bar/select-date-range-safe-fallback');

exports._parent        = require('./statistics-flow');
exports._customFilters = Function.prototype;

exports['flow-nav']            = { class: { 'submitted-menu-item-active': true } };
exports['flow-rejections-nav'] = { class: { 'pills-nav-active': true } };

exports['statistics-main'] = function () {
	var queryHandler, data = new ObservableValue([])
	  , pagination = new Pagination('/flow/rejections/');

	queryHandler = setupQueryHandler(queryHandlerConf,
		location, '/flow/rejections/');

	queryHandler.on('query', function (query) {
		var serverQuery = copy(query), dateFrom, dateTo;

		dateFrom = query.dateFrom;
		dateTo   = query.dateTo || new db.Date();

		serverQuery.dateFrom = dateFrom.toJSON();
		serverQuery.dateTo = dateTo.toJSON();
		// hard code for tests

		queryServer(serverQuery).done(function (responseData) {
			data.value = responseData.rows || [];

			pagination.current.value = Number(serverQuery.page);
			pagination.count.value   = responseData.pageCount;
		});
	});

	div({ class: 'block-pull-up' },
		form({ action: '/flow/rejections/', autoSubmit: true },
			section({ class: 'date-period-selector-positioned-on-submenu' }, dateFromToBlock()),
			section({ class: 'section-primary users-table-filter-bar display-flex flex-wrap' },
				div(
					div({ class: 'users-table-filter-bar-status' },
						selectService({ label: _("All services") })),
					div({ class: 'users-table-filter-bar-status' },
						selectRejectionReason())
				),
				p({ class: 'submit' }, input({ type: 'submit' }))),
			section({ class: 'pad-if-pagination' }, pagination),
			br(),
			data.map(function (result) {
				return section({ class: "section-primary" },
					table({ class: 'statistics-table' },
						thead(
							th(_("Rejection reasons")),
							th(),
							th(),
							th(_("Operator")),
							th(_("Role")),
							th(_("Date")),
							th(_("File"))
						),
						tbody(result.length ? result.map(function (dataRow) {
							return tr(dataRow.map(function (cellContent, index) {
								if (index === 1) {
									return td(span({ class: "fa fa-star" }, cellContent));
								}
								return td(cellContent);
							}));
						}) : tr(td({ class: 'empty statistics-table-info', colspan: 7 },
							_("No data for this criteria"))))));
			})));
};
