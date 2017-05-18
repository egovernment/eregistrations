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

		debugger
		console.log('previousNumberOfRows', previousNumberOfRows, element.find('tr').length)
		if (previousNumberOfRows !== element.find('tr').length) {
			previousNumberOfRows = element.find('tr').length;
			element.trigger('update');
		}

	}, 500);
};
