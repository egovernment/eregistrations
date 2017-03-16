'use strict';

var _              = require('mano').i18n.bind('View: Statistics')
  , selectService  = require('./components/filter-bar/select-service')
  , selectDateFrom = require('./components/filter-bar/select-date-from')
  , selectDateTo   = require('./components/filter-bar/select-date-to');

exports._parent        = require('./statistics-flow');
exports._customFilters = Function.prototype;

exports['flow-nav']            = { class: { 'submitted-menu-item-active': true } };
exports['flow-rejections-nav'] = { class: { 'pills-nav-active': true } };

exports['statistics-main'] = function () {
	section(
		{ class: 'section-primary users-table-filter-bar' },
		form(
			{ action: '/flow/rejections', autoSubmit: true },
			div({ class: 'users-table-filter-bar-status' },
				selectService({ label: _("All services") })),
			div(
				{ class: 'users-table-filter-bar-status' },
				label({ for: 'date-from-input' }, _("Date from"), ":"),
				selectDateFrom()
			),
			div(
				{ class: 'users-table-filter-bar-status' },
				label({ for: 'date-to-input' }, _("Date to"), ":"),
				selectDateTo()
			),
			p({ class: 'submit' }, input({ type: 'submit' }))
		)
	);
};
