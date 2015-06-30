'use strict';

var Database           = require('dbjs')
  , defineDocument     = require('../../../../model/document')
  , defineRequirements = require('../../../../model/business-process-new/requirements');

module.exports = function (t, a) {
	var db = new Database()
	  , Document = defineDocument(db)
	  , BusinessProcess = defineRequirements(db)
	  , Doc1 = Document.extend('Test1', {},
			{ label: { value: "Test 1" }, legend: { value: "Legend of Test 1" } })
	  , Doc2 = Document.extend('Test2', {},
			{ label: { value: "Test 2" }, legend: { value: "Legend of Test 2" } });

	t(BusinessProcess, [Doc1, Doc2, { name: 'foo', class: Doc1 }]);

	a(BusinessProcess.prototype.requirements.map.test1.Document, Doc1);
	a(BusinessProcess.prototype.requirements.map.test2.Document, Doc2);
	a(BusinessProcess.prototype.requirements.map.test2.label, "Test 2");
	a(BusinessProcess.prototype.requirements.map.test2.legend, "Legend of Test 2");

	a(BusinessProcess.prototype.requirements.map.foo.Document, Doc1);
	a(BusinessProcess.prototype.requirements.map.foo.label, "Test 1");
	a(BusinessProcess.prototype.requirements.map.foo.legend, "Legend of Test 1");

	a(BusinessProcess.prototype.requirements.map.bar, undefined);
};
