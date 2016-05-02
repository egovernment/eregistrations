// Set a 'active' class on views resolved document id.

'use strict';

var camelToHyphen = require('es5-ext/string/#/camel-to-hyphen');

module.exports = function (documentTypePrefix) {
	return function (doc) {
		var listItemId = documentTypePrefix + '-item-' + camelToHyphen.call(this.documentUniqueKey)
		  , conf       = {};

		conf[listItemId] = { class: { active: true } };

		return conf;
	};
};
