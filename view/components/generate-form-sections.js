'use strict';

var ns = require('mano').domjs.ns
  , customError = require('es5-ext/error/custom')
  , document = require('mano').domjs.document;

module.exports = function (sections/*, options */) {
	var result, options;
	result = [];
	options = Object(arguments[1]);
	if (options.isChildEntity && sections.size > 1) {
		throw customError("The usage of isChildEntity = true " +
			"with multiple sections is currently not supported," +
			"plsease use FormSectionGroup instead", "UNSUPPORTED_SECTIONS_FUNCTIONALITY");
	}
	sections.forEach(function (section) {
		result.push(ns._if(section._isApplicable, section.toDOMForm(document, options)));
	});

	return result;
};
