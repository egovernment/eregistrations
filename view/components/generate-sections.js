'use strict';

var ns = require('mano').domjs.ns
  , document = require('mano').domjs.document;

module.exports = function (sections/*, options */) {
	var headerRank, options, result;
	options = Object(arguments[1]);
	headerRank = options.headerRank || 3;
	result = [];
	sections.forEach(function (section) {
		result.push(ns._if(section._isApplicable,
			section.toDOM(document, { headerRank: headerRank })));
	});
	return result;
};
