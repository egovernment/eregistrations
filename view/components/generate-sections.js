'use strict';

var ns = require('mano').domjs.ns;

module.exports = function (sections/*, options */) {
	var headerRank, options, result;
	options = Object(arguments[1]);
	headerRank = options.headerRank || 3;
	result = [];
	sections.forEach(function (section) {
		result.push(ns._if(section._isApplicable,
			section.toDOM(ns.document, { headerRank: headerRank })));
	});
	return result;
};
