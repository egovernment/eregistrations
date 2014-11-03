'use strict';

var ns = require('mano').domjs.ns;

module.exports = function (sections/*, options */) {
	var result, options;
	result = [];
	options = arguments[1];
	sections.forEach(function (section) {
		result.push(ns._if(section._isApplicable, section.toDOMForm(ns.document, options)));
	});

	return result;
};
