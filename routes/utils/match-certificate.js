'use strict';

var hyphenToCamel = require('es5-ext/string/#/hyphen-to-camel');

module.exports = function (collectionOwner, collection) {
	return function (certificateKey) {
		var certificate = this.businessProcess.certificates.map.get(
			hyphenToCamel.call(certificateKey)
		);

		if (!certificate) return false;
		if (!this[collectionOwner].certificates[collection].has(certificate)) {
			return false;
		}

		this.document = certificate;
		return true;
	};
};
