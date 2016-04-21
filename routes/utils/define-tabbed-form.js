'use strict';

var camelToHyphen       = require('es5-ext/string/#/camel-to-hyphen')
  , ensureStringifiable = require('es5-ext/object/validate-stringifiable-value');

/**
 * @description
 * Called from routes for each section which should be displayed in form section tabs.
 * Usade example: defineTabbedForm('investmentInformation', { isDefault: true, context: exports });
 *
 * @param sectionKey                  - Name on the section's map
 * @param {Object}  options           - options
 * @param {Object}  options.context   - Usually a view routes should be passed
 * @param {Boolean} options.isDefault - Is this tab a default forms view?
 * @returns {Object}
 */
module.exports = function (sectionKey/*, options */) {
	var pageUrl, context, options = Object(arguments[1]);
	ensureStringifiable(sectionKey);

	pageUrl = options.isDefault ? 'forms' : ('forms/' + camelToHyphen.call(sectionKey));
	context = options.context || Object.create(null);

	context[pageUrl] = {
		decorateContext: function () {
			this.section = this.businessProcess.dataForms.map[sectionKey];
		},
		view: require('../../view/business-process-data-forms-section-tab')
	};

	return context;
};
