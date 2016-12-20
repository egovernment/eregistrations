// Set a 'forms-tab-nav-tab-active' class on tabular views resolved out of section.

'use strict';

module.exports = function () {
	var listItemId = 'tab-item-' + this.section.domId
	  , conf = {};

	conf[listItemId] = { class: { 'forms-tab-nav-tab-active': true } };

	return conf;
};
