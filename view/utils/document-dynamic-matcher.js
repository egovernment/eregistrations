// Set a 'active' class on views resolved document id.

'use strict';

module.exports = function (documentTypePrefix) {
	return function (doc) {
		var listItemId = documentTypePrefix + '-item-' + this.document.docId
		  , conf       = {};

		conf[listItemId] = { class: { active: true } };

		return conf;
	};
};
