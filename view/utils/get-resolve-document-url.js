'use strict';

var camelToHyphen   = require('es5-ext/string/#/camel-to-hyphen')
  , ensureString    = require('es5-ext/object/validate-stringifiable-value')
  , ensureObject    = require('es5-ext/object/valid-object');

module.exports = function (kind, collection/*, options*/) {
	var options           = Object(arguments[2])
	  , urlPrefix         = options.urlPrefix || '/';

	kind = ensureString(kind);
	ensureObject(collection);
	return function (data) {
		var url = urlPrefix;
		if (!data) return null;
		if (kind === 'certificate') url += 'certificates';
		else if (kind === 'requirementUpload') url += 'documents';
		else if (kind === 'paymentReceiptUpload') url += 'payment-receipts';
		else throw new Error(kind + " is not recognized document kind");

		return url + '/' + camelToHyphen.call(data.uniqueKey) + '/#submitted-box';
	};
};
