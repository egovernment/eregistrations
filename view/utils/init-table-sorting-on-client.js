'use strict';

var normalizeOptions = require('es5-ext/object/normalize-options');

module.exports = function (domElement/*, opts */) {
	if (!window.jQuery) return;
	var opts = normalizeOptions(arguments[1]);
	setInterval(function () {
		var element = window.jQuery(domElement);
		element.trigger('update');
		element.tablesorter(opts);
	}, 500);
};
