'use strict';

var Database       = require('dbjs')
  , defineDocument = require('../../../../model/document')
  , defineUploads  = require('../../../../model/business-process-new/requirement-uploads');

module.exports = function (t, a) {
	var db = new Database()
	  , Document = defineDocument(db)
	  , BusinessProcess = defineUploads(db)
	  , Doc1 = Document.extend('Test1', {},
			{ label: { value: "Test 1" }, legend: { value: "Legend of Test 1" } })
	  , Doc2 = Document.extend('Test2', {},
			{ label: { value: "Test 2" }, legend: { value: "Legend of Test 2" } })
	  , Doc3 = Document.extend('Test3', {},
			{ label: { value: "Test 3" }, legend: { value: "Legend of Test 3" } });

	t(BusinessProcess, [Doc1, Doc2, { name: 'foo', class: Doc1 },
		{ name: 'fooBar', class: Doc1, label: 'Test label' }, { class: Doc3, label: 'Test label 3' }]);

	BusinessProcess.prototype.requirements.map.defineProperties({ test1: { nested: true } });
	BusinessProcess.prototype.requirements.map.test1.label = "Req Test1 Label";
	BusinessProcess.prototype.requirements.map.test1.legend = "Req Test1 Legend";

	a(BusinessProcess.prototype.requirementUploads.map.test1.document instanceof Doc1, true);
	a(BusinessProcess.prototype.requirementUploads.map.test1.document.label, "Req Test1 Label");
	a(BusinessProcess.prototype.requirementUploads.map.test1.document.legend, "Req Test1 Legend");
	a(BusinessProcess.prototype.requirementUploads.map.test1.document.uniqueKey, 'test1');

	a(BusinessProcess.prototype.requirementUploads.map.test2.document instanceof Doc2, true);
	a(BusinessProcess.prototype.requirementUploads.map.test2.document.label, "Test 2");
	a(BusinessProcess.prototype.requirementUploads.map.test2.document.legend, "Legend of Test 2");
	a(BusinessProcess.prototype.requirementUploads.map.test2.document.uniqueKey, 'test2');

	a(BusinessProcess.prototype.requirementUploads.map.foo.document instanceof Doc1, true);
	a(BusinessProcess.prototype.requirementUploads.map.foo.document.label, "Test 1");
	a(BusinessProcess.prototype.requirementUploads.map.foo.document.legend, "Legend of Test 1");
	a(BusinessProcess.prototype.requirementUploads.map.foo.document.uniqueKey, 'foo');

	a(BusinessProcess.prototype.requirementUploads.map.bar, undefined);
	a(BusinessProcess.prototype.requirementUploads.map.fooBar.document.label, 'Test label');
	a(BusinessProcess.prototype.requirementUploads.map.test3.document.label, 'Test label 3');
};
