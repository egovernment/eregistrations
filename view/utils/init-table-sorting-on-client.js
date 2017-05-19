'use strict';

module.exports = function (jQuerySelector) {
	if (!window.jQuery) return;
	var checkExist = setInterval(function () {
		var element = window.jQuery(jQuerySelector);
		if (element.length) {
			element.tablesorter();
			clearInterval(checkExist);
		}
	}, 500);
};
