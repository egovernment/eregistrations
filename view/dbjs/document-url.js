'use strict';

var db            = require('mano').db
  , d             = require('d')
  , camelToHyphen = require('es5-ext/string/#/camel-to-hyphen')
  , lazy          = require('d/lazy');

Object.defineProperties(db.Document.prototype, lazy({
	docUrl: d(function () {
		var url = '/';
		if (this.owner.owner.key === 'certificates') {
			url += 'certificate/' + camelToHyphen.call(this.key) + '/';
		} else if (this.owner.owner.owner.key === 'requirementUploads') {
			url += 'document/' + camelToHyphen.call(this.uniqueKey) + '/';
		} else if (this.owner.owner.owner.key === 'paymentReceiptUploads') {
			url += 'receipt/' + camelToHyphen.call(this.owner.key) + '/';
		} else {
			throw new Error("Unrecognized document");
		}
		return url;
	})
}));
