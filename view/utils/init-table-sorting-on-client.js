'use strict';

module.exports = function (domElement, tableSorterOpts) {
	setInterval(function () {
		var element = window.jQuery(domElement);
		element.trigger('update');
		element.tablesorter(tableSorterOpts);
	}, 500);
};
