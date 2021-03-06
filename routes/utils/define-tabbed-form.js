'use strict';

var camelToHyphen       = require('es5-ext/string/#/camel-to-hyphen')
  , ensureStringifiable = require('es5-ext/object/validate-stringifiable-value');

/**
 * @description
 * Called from view routes for each section which should be displayed in form section tabs.
 * Usage example: defineTabbedForm('investmentInformation', { isDefault: true, context: exports });
 *
 * @param sectionKey                  - Name on the section's map
 * @param {Object}  options           - options
 * @param {Object}  options.context   - Usually a view routes should be passed
 * @param {Boolean} options.isDefault - Is this tab a default forms view?
 * @param {String}  options.urlPrefix - route prefix for section pageUrl
 * @returns {Object}
 */
module.exports = function (sectionKey/*, options */) {
	var pageUrl, context, urlPrefix, options = Object(arguments[1]);
	ensureStringifiable(sectionKey);

	urlPrefix = options.urlPrefix || 'forms';
	if (urlPrefix === '/') {
		pageUrl = options.isDefault ? urlPrefix : camelToHyphen.call(sectionKey);
	} else {
		pageUrl = options.isDefault ? urlPrefix : urlPrefix + '/' + camelToHyphen.call(sectionKey);
	}
	context = options.context || Object.create(null);

	context[pageUrl] = {
		decorateContext: function () {
			this.section = this.businessProcess.dataForms.map[sectionKey];
		},
		view: require('../../view/business-process-data-forms-section-tab')
	};

	return context;
};
