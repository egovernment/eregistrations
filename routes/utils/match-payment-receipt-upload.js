'use strict';

var hyphenToCamel = require('es5-ext/string/#/hyphen-to-camel');

module.exports = function (collectionOwner) {
	return function (receiptKey) {
		var paymentReceiptUpload = this.businessProcess.paymentReceiptUploads.map.get(
			hyphenToCamel.call(receiptKey)
		);

		if (!paymentReceiptUpload) return false;
		if (!this[collectionOwner].paymentReceiptUploads.applicable.has(paymentReceiptUpload)) {
			return false;
		}

		this.document = paymentReceiptUpload.document;
		return true;
	};
};
