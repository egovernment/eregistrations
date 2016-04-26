'use strict';

var hyphenToCamel = require('es5-ext/string/#/hyphen-to-camel');

module.exports = function (collectionOwner) {
	return function (documentUniqueKey) {
		documentUniqueKey = hyphenToCamel.call(documentUniqueKey);

		return this[collectionOwner].requirementUploads.applicable.some(function (requirementUpload) {
			if (requirementUpload.document.uniqueKey === documentUniqueKey) {
				this.document = requirementUpload.document;
				return true;
			}
		}, this);
	};
};
