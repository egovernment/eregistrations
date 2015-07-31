/**
 * Used to generate forms from sections.
 * This component should be used to display sections in part A.
 */

'use strict';

var ns = require('mano').domjs.ns
  , customError = require('es5-ext/error/custom')
  , isSet = require('es6-set/is-set')
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
	if (isSet(sections)) {
		sections.forEach(function (section) {
			result.push(section.toDOMForm(document, options));
		});
		return result;
	}
	//TODO: Below is deprecated code which expects map (old model version)
	sections.forEach(function (section) {
		result.push(ns._if(section._isApplicable, section.toDOMForm(document, options)));
	});

	return result;
};
