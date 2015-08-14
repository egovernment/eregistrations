'use strict';

var camelToHyphen = require('es5-ext/string/#/camel-to-hyphen');

module.exports  = function (doc) {
	var name = 'business-process-document-archive-' + doc.master.__id__ + '-'
	  , owner = doc.owner.owner;
	if (owner.key === 'certificates') {
		name += 'certificate-' + camelToHyphen.call(doc.key);
	} else {
		owner = owner.owner;
		if (owner.key === 'requirementUploads') {
			name += 'requirement-' + camelToHyphen.call(doc.uniqueKey);
		} else if (owner.key === 'paymentReceiptUploads') {
			name += 'receipt-' + camelToHyphen.call(doc.owner.key);
		} else {
			throw new Error("Unrecognized document " + JSON.stringify(doc.__id__));
		}
	}
	return name + '.zip';
};
