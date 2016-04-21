'use strict';

var camelToHyphen = require('es5-ext/string/#/camel-to-hyphen');

// To be called in view router context
module.exports = function (sectionKey/*, options */) {
	var pageUrl, context, options = Object(arguments[1]);

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
