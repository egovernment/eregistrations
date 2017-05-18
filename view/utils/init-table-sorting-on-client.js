'use strict';

module.exports = function (domElement) {
	var previous;
	var previousNumberOfRows;

	setInterval(function () {
		var element = window.jQuery(domElement);

		if (!previous || previous !== element) {
			previous = element;
			previousNumberOfRows = element.find('tr').length;
			element.tablesorter();
			return
		}

		if (previousNumberOfRows !== element.find('tr').length) {
			previousNumberOfRows = element.find('tr').length;
			element.trigger('update');
		}

	}, 500);
};
