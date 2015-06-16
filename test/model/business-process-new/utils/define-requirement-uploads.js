'use strict';

var Database       = require('dbjs')
  , defineDocument = require('../../../../model/document');

module.exports = function (t, a) {
	var db = new Database()
	  , Document = defineDocument(db)
	  , Doc1 = Document.extend('Test1', {},
			{ label: { value: "Test 1" }, legend: { value: "Legend of Test 1" } })
	  , Doc2 = Document.extend('Test2', {},
			{ label: { value: "Test 2" }, legend: { value: "Legend of Test 2" } });

	t(db, [Doc1, Doc2, { name: 'foo', class: Doc1 }]);

	db.BusinessProcess.prototype.requirements.map.defineProperties({ test1: { nested: true } });
	db.BusinessProcess.prototype.requirements.map.test1.label = "Req Test1 Label";
	db.BusinessProcess.prototype.requirements.map.test1.legend = "Req Test1 Legend";

	a(db.BusinessProcess.prototype.requirementUploads.map.test1.document instanceof Doc1, true);
	a(db.BusinessProcess.prototype.requirementUploads.map.test1.document.label, "Req Test1 Label");
	a(db.BusinessProcess.prototype.requirementUploads.map.test1.document.legend, "Req Test1 Legend");
	a(db.BusinessProcess.prototype.requirementUploads.map.test1.document.uniqueKey, 'test1');

	a(db.BusinessProcess.prototype.requirementUploads.map.test2.document instanceof Doc2, true);
	a(db.BusinessProcess.prototype.requirementUploads.map.test2.document.label, "Test 2");
	a(db.BusinessProcess.prototype.requirementUploads.map.test2.document.legend, "Legend of Test 2");
	a(db.BusinessProcess.prototype.requirementUploads.map.test2.document.uniqueKey, 'test2');

	a(db.BusinessProcess.prototype.requirementUploads.map.foo.document instanceof Doc1, true);
	a(db.BusinessProcess.prototype.requirementUploads.map.foo.document.label, "Test 1");
	a(db.BusinessProcess.prototype.requirementUploads.map.foo.document.legend, "Legend of Test 1");
	a(db.BusinessProcess.prototype.requirementUploads.map.foo.document.uniqueKey, 'foo');

	a(db.BusinessProcess.prototype.requirementUploads.map.bar, undefined);
};
