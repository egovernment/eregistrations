/**
 * Used to generate data overview from sections.
 * This component should be used to display sections in part B.
 */

'use strict';

var ns               = require('mano').domjs.ns
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , document         = require('mano').domjs.document;

module.exports = function (sections/*, options */) {
	var options = normalizeOptions(arguments[1]), result;
	if (!options.headerRank) options.headerRank = 3;
	result = [];
	sections.forEach(function (section) {
		result.push(ns._if(section._isApplicable,
			section.toDOM(document, options)));
	});
	return result;
};
