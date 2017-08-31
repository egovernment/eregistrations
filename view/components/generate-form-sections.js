/**
 * Used to generate forms from sections.
 * This component should be used to display sections in part A.
 */

'use strict';

var customError = require('es5-ext/error/custom')
  , _           = require('mano').i18n
  , isSet       = require('es6-set/is-set')
  , assign      = require('es5-ext/object/assign')
  , document    = require('mano').domjs.document
  , getUpdateSectionHeader = require('./get-update-section-header');

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
			return _if(section._isDisplayableForUpdate,
				_if(section._isAwaitingUpdate, section.toDOM(document,
					assign({}, options,
						{
							headerRank: 2,
							cssClass: "section-primary entity-data-section",
							displayEmptyFields: true,
							customHeader: getUpdateSectionHeader(
								section,
								false,
								_("Update"),
								_("This section has been updated")
							)
						}
						)), section.toDOMForm(document, assign({}, options,
							{
						customHeader: getUpdateSectionHeader(
							section,
							true,
							_("Cancel")
						)
					}))),
				section.toDOMForm(document, options));
		});
	}
	//TODO: Below is deprecated code which expects map (old model version)
	result = [];
	sections.forEach(function (section) {
		result.push(_if(section._isApplicable, section.toDOMForm(document, options)));
	});

	return result;
};
