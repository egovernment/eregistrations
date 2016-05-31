/**
 * Used to generate forms from sections.
 * This component should be used to display sections in part A.
 */

'use strict';

var customError = require('es5-ext/error/custom')
  , isSet       = require('es6-set/is-set')
  , document    = require('mano').domjs.document;

module.exports = function (sections/*, options */) {
	var result, options;
	options = Object(arguments[1]);
	if (options.isChildEntity && sections.size > 1) {
		throw customError("The usage of isChildEntity = true " +
			"with multiple sections is currently not supported," +
			"plsease use FormSectionGroup instead", "UNSUPPORTED_SECTIONS_FUNCTIONALITY");
	}
	if (isSet(sections)) {
		return list(sections, function (section) {
			return section.toDOMForm(document, options);
		});
	}
	//TODO: Below is deprecated code which expects map (old model version)
	result = [];
	sections.forEach(function (section) {
		result.push(_if(section._isApplicable, section.toDOMForm(document, options)));
	});

	return result;
};
