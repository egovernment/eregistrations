'use strict';

module.exports = function (jQuerySelector) {
	var checkExist = setInterval(function () {
		var element = window.jQuery(jQuerySelector);
		if (element.length) {
			element.tablesorter();
			clearInterval(checkExist);
		}
	}, 1000);
};
