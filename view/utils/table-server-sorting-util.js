'use strict';

module.exports = function (id, opts) {
	setTimeout(function () {
		var elem = window.jQuery('#' + id + '[col=' + opts.col + ']');
		elem.addClass('tablesorter-default');
		if (opts.asc === '1') {
			elem.addClass('headerSortUp');
		} else {
			elem.addClass('headerSortDown');
		}
		elem.wrapInner("<div class='tablesorter-header-inner'></div>");
	}, 250);
};