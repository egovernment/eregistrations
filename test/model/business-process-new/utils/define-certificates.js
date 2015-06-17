'use strict';

var Database       = require('dbjs')
  , defineDocument = require('../../../../model/document');

module.exports = function (t, a) {
	var db = new Database()
	  , Document = defineDocument(db)
	  , Doc1 = Document.extend('Test1')
	  , Doc2 = Document.extend('Test2');

	t(db, [Doc1, Doc2]);

	a(db.BusinessProcess.prototype.certificates.map.test1 instanceof Doc1, true);
	a(db.BusinessProcess.prototype.certificates.map.test2 instanceof Doc2, true);
	a(db.BusinessProcess.prototype.certificates.map.foo, undefined);
};
