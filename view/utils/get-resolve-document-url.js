'use strict';

var camelToHyphen   = require('es5-ext/string/#/camel-to-hyphen')
  , ensureString    = require('es5-ext/object/validate-stringifiable-value')
  , ensureObject    = require('es5-ext/object/valid-object')
  , reactiveSibling = require('../utils/reactive-document-sibling');

module.exports = function (kind, collection/*, options*/) {
	var options           = Object(arguments[2])
	  , urlPrefix         = options.urlPrefix || '/'
	  , documentsRootHref = options.documentsRootHref;

	kind = ensureString(kind);
	ensureObject(collection);
	return function (data) {
		var url = urlPrefix;
		if (!data) return null;
		if (kind === 'certificate') url += 'certificates';
		else if (kind === 'requirementUpload') url += 'documents';
		else if (kind === 'paymentReceiptUpload') url += 'payment-receipts';
		else throw new Error(kind + " is not recognized document kind");
		if (!documentsRootHref) return url + '/' + camelToHyphen.call(data.uniqueKey) + '/';
		return reactiveSibling.previous(collection, data.uniqueKey).map(function (previous) {
			if (!previous) return documentsRootHref;
			return url + '/' + camelToHyphen.call(data.uniqueKey) + '/';
		});
	};
};
