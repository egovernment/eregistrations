// Set a 'active' class on views resolved document id.

'use strict';

module.exports = function (doc) {
	var listItemId = 'document-item-' + this.document.docId
	  , conf       = {};

	conf[listItemId] = { class: { active: true } };

	return conf;
};
