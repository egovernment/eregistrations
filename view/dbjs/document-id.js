'use strict';

var db            = require('mano').db
  , d             = require('d')
  , camelToHyphen = require('es5-ext/string/#/camel-to-hyphen')
  , lazy          = require('d/lazy');

Object.defineProperties(db.Document.prototype, lazy({
	docId: d(function () {
		if (this.owner.owner.key === 'certificates') {
			return camelToHyphen.call(this.key);
		}
		if (this.owner.owner.owner.key === 'requirementUploads') {
			return camelToHyphen.call(this.uniqueKey);
		}
		if (this.owner.owner.owner.key === 'paymentReceiptUploads') {
			return camelToHyphen.call(this.owner.key);
		}

		throw new Error("Unrecognized document");
	})
}));
