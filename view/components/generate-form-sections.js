/**
 * Used to generate forms from sections.
 * This component should be used to display sections in part A.
 */

'use strict';

var customError = require('es5-ext/error/custom')
  , _           = require('mano').i18n
  , isSet       = require('es6-set/is-set')
  , assign      = require('es5-ext/object/assign')
  , document    = require('mano').domjs.document;

module.exports = function (sections/*, options */) {
	var result, options, displayForUpdate;
	options = Object(arguments[1]);
	if (options.isChildEntity && sections.size > 1) {
		throw customError("The usage of isChildEntity = true " +
			"with multiple sections is currently not supported," +
			"plsease use FormSectionGroup instead", "UNSUPPORTED_SECTIONS_FUNCTIONALITY");
	}
	if (isSet(sections)) {
		return list(sections, function (section) {
			displayForUpdate = and(section._isDisplayableForUpdate, section._isAwaitingUpdate);
			return _if(displayForUpdate,
				section.toDOM(document,
					assign(options,
						{
							headerRank: 2,
							cssClass: "section-primary entity-data-section",
							displayEmptyFields: true,
							customHeader: function (defaultHeader) {
								return div({ class: "section-update-header-container" },
									defaultHeader,
									div({ class: "section-update-header-side-panel" },
										_if(section._lastEditStamp, span(
											_("This section has been updated")
										)), button({
											type: "submit",
											onclick: function () {
												section.isAwaitingUpdate = false;
											}
										}, _("Update"))));
							}
						})),
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
