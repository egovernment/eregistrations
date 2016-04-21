'use strict';

var camelToHyphen = require('es5-ext/string/#/camel-to-hyphen')
  , defaultView   = require('../../view/business-process-data-forms-section-tab');

// To be called in view router context
module.exports = function (sectionName, isDefaultRoute, view, nameOnMap) {
	var pageUrl = isDefaultRoute ? 'forms' : ('forms/' + camelToHyphen.call(sectionName));

	this[pageUrl] = {
		decorateContext: function () {
			this.section = this.businessProcess.dataForms.map[nameOnMap || sectionName];
		},
		view: view || defaultView
	};
};
