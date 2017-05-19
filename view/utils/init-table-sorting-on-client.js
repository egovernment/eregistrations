'use strict';

module.exports = function (domElement, tableSorterOpts) {
	var previous;
	var previousNumberOfRows;

	setInterval(function () {
		var element = window.jQuery(domElement);
		element.trigger('update');
		element.tablesorter(tableSorterOpts);
	}, 500);
};
