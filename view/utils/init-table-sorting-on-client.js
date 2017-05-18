'use strict';

var location        = require('mano/lib/client/location');

module.exports = function (jQuerySelector) {
		var checkExist = setInterval(function () {
			var element = window.jQuery(jQuerySelector);
			if (element.length) {
				element.tablesorter();
			}
		}, 1000);
};
