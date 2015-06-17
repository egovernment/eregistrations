'use strict';

var Database              = require('dbjs')
  , defineBusinessProcess = require('../../model/business-process/base')
  , defineDate            = require('dbjs-ext/date-time/date');

module.exports = function (t, a) {
	var db = new Database()
	  , FormSection = t(db)
	  , TestFormSection
	  , BusinessProcess = defineBusinessProcess(db)
	  , DateType = defineDate(db)
	  , businessProcess, section;

	TestFormSection = FormSection.extend('TestFormSection', {
		actionUrl: { value: 'action' },
		propertyNames: { value: ['prop1', 'prop2', 'prop3'] },
		resolventProperty: { value: 'prop0' },
		resolventValue: { value: true }
	});
	//section's resolvent
	BusinessProcess.prototype.defineProperties(
		{
			prop0: {
				type: db.Boolean,
				required: true,
				value: false
			},
			prop1: { type: db.String, required: true },
			prop2: { type: db.Number },
			prop3: { type: db.Boolean, required: true },
			section: { type: TestFormSection, nested: true }
		}
	);
	businessProcess = new BusinessProcess();
	section = businessProcess.section;
	a(section.actionUrl, 'action');
	a(section.weight, 0); // default value is setup on prototype, so ignore (weight 0)
	businessProcess.prop0 = true;
	a(section.weight, 2);
	a(section.status, 0);
	businessProcess.prop1 = "test";
	a(section.status, 0.5);
	businessProcess.prop0 = false;
	a(section.status, 1);
	businessProcess.prop0 = true;
	businessProcess.prop3 = true;
	a(section.status, 1);
	a(String(section.lastEditDate), String(new DateType(businessProcess.$prop3.lastModified / 1000)));
};
