'use strict';

var _                 = require('mano').i18n.bind('Daterange fallback block')
  , selectDateTo      = require('./select-date-to')
  , selectDateFrom    = require('./select-date-from')
  , selectDateRange   = require('./select-date-range');

module.exports = function (/* opts */) {
	if (window.jQuery) {
		return div({ class: 'rangepicker-pull-right' },
			selectDateRange());
	}
	return div({ class: 'rangepicker-pull-right' }, div(
		{ class: 'users-table-filter-bar-status' },
		label({ for: 'date-from-input' }, _("Date from"), ":"),
		selectDateFrom()
	), div(
		{ class: 'users-table-filter-bar-status' },
		label({ for: 'date-to-input' }, _("Date to"), ":"),
		selectDateTo()
	));
};
