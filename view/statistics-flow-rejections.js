'use strict';

var _                            = require('mano').i18n.bind('View: Statistics')
  , env                          = require('mano').env
  , location                     = require('mano/lib/client/location')
  , selectService                = require('./components/filter-bar/select-service')
  , tableColumns                 = require('./components/statistics-rejections-table-columns')
  , dateFromToBlock     = require('./components/filter-bar/select-date-range-safe-fallback')
  , getStatisticsRejectionsTable = require('./components/statistics-rejections-table');

exports._parent        = require('./statistics-flow');
exports._customFilters = Function.prototype;

exports['flow-nav']            = { class: { 'submitted-menu-item-active': true } };
exports['flow-rejections-nav'] = { class: { 'pills-nav-active': true } };

exports['statistics-main'] = function () {
	var rejectionsTable = getStatisticsRejectionsTable({
		columns: tableColumns,
		getOrderIndex: exports._getOrderIndex,
		itemsPerPage: env.objectsListItemsPerPage,
		tableUrl: location.pathname,
		class: 'submitted-user-data-table datatable'
	});

	div({ class: 'block-pull-up' },
		form({ action: '/flow/rejections', autoSubmit: true },
			section({ class: 'date-period-selector-positioned-on-submenu' }, dateFromToBlock()),
			section({ class: 'section-primary users-table-filter-bar' },
				div({ class: 'users-table-filter-bar-status' },
					selectService({ label: _("All services") })),
				p({ class: 'submit' }, input({ type: 'submit' }))
				)),
		br(),
		section({ class: 'pad-if-pagination' }, rejectionsTable.pagination),
		section({ class: 'table-responsive-container' }, rejectionsTable),
		section({ class: 'pad-if-pagination' }, rejectionsTable.pagination));

	var checkExist = setInterval(function() {
		var element = window.jQuery('.datatable');
		if (element.length) {
			element.tablesorter();
			clearInterval(checkExist);
		}
	}, 500);

};

exports._getOrderIndex = function (businessProcess) {
	return businessProcess.lastModified;
};
