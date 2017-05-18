'use strict';

module.exports = function (jQuerySelector) {
	var previous;
	setInterval(function () {
		//prevent initalizing tablesorter if the element had the tablesorter and listeners on
		//elements may not equal if user leaves the page and then comes back
		if (previous && previous[0] === window.jQuery(jQuerySelector)[0]) {
			return;
		}

		var element = window.jQuery(jQuerySelector);
		previous = element;
		if (element.length) {
			element.tablesorter();
		}
		element.bind("DOMSubtreeModified", function () {
			element.tablesorter();
		});
	}, 500);
};
