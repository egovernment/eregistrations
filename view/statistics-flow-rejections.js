'use strict';

var _                            = require('mano').i18n.bind('View: Statistics')
  , db                = require('../db')
  , location          = require('mano/lib/client/location')
  , rejectionsHandlerConf  = require('../apps/statistics/rejections-query-conf')
  , setupQueryHandler = require('../utils/setup-client-query-handler')
  , copy              = require('es5-ext/object/copy')
  , ObservableValue   = require('observable-value')
  , Pagination        = require('./components/pagination')
  , selectService     = require('./components/filter-bar/select-service')
  , selectRejectionReason = require('./components/filter-bar/select-rejection-reason')
  , queryServer       = require('./utils/statistics-rejections-query-server')
  , dateFromToBlock    = require('./components/filter-bar/select-date-range-safe-fallback')
  , getDynamicUrl      = require('./utils/get-dynamic-url');

exports._parent        = require('./statistics-flow');
exports._customFilters = Function.prototype;

exports['flow-nav']            = { class: { 'submitted-menu-item-active': true } };
exports['flow-rejections-nav'] = { class: { 'pills-nav-active': true } };

exports['statistics-main'] = function () {
	var queryHandler, data = new ObservableValue([])
	  , pagination = new Pagination('/flow/rejections/')
	  , params;

	queryHandler = setupQueryHandler(rejectionsHandlerConf,
		location, '/flow/rejections/');

	params = queryHandler._handlers.map(function (handler) {
		return handler.name;
	});

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
				div(
					div(
						a({
							class: 'users-table-filter-bar-print',
							href: getDynamicUrl('/flow-rejections-data.pdf', { only: params }),
							target: '_blank'
						}, span({ class: 'fa fa-print' }), " ", _("Print pdf"))
					),
					div(
						a({
							class: 'users-table-filter-bar-print',
							href: getDynamicUrl('/flow-rejections-data.csv', { only: params }),
							target: '_blank'
						}, span({ class: 'fa fa-print' }), " ", _("Print csv"))
					)
				),
				p({ class: 'submit' }, input({ type: 'submit' }))),
			section({ class: 'pad-if-pagination' }, pagination),
			br(),
			data.map(function (result) {
				return section({ class: 'table-responsive-container' },
					table({ class: 'submitted-user-data-table' },
						thead(
							th({ class: "submitted-user-data-table-date-time" }, _("Rejection reason")),
							th({ class: "submitted-user-data-table-date-time" }),
							th({ class: "submitted-user-data-table-date-time" }),
							th({ class: "submitted-user-data-table-date-time" }, _("Operator")),
							th({ class: "submitted-user-data-table-date-time" }, _("Role")),
							th({ class: "submitted-user-data-table-date-time" }, _("Date")),
							th({ class: "submitted-user-data-table-date-time" }, _("File")),
							th({ class: "submitted-user-data-table-date-time" })
						),
						tbody(result.length ? result.map(function (dataRow) {
							return tr(dataRow.map(function (cellContent, index) {
								var defaultOpts = { class: "submitted-user-data-table-date-time" };
								if (index === 0) {
									return td(defaultOpts, cellContent.map(function (cellItem) {
										return p(cellItem);
									}));
								}
								if (index === 1 && cellContent === '*') {
									return td(defaultOpts, span({ class: "fa fa-star" }));
								}
								if (index === 6) {
									return td({ class: "submitted-user-data-table-name" }, cellContent);
								}
								if (index === 7) {
									return td({ class: "submitted-user-data-table-link" }, a({ class: 'actions-edit',
											href: url(cellContent) },
										span({ class: 'fa fa-search' }, _("Go to"))));
								}
								return td(defaultOpts, cellContent);
							}));
						}) : tr({ class: 'empty' }, td({ colspan: 8 },
							_("No data for this criteria"))))));
			})));
};
