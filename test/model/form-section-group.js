'use strict';

var Database              = require('dbjs')
  , defineBusinessProcess = require('../../model/business-process/base')
  , defineFormSection     = require('../../model/form-section');

module.exports = function (t, a) {
	var db = new Database()
	  , FormSectionGroup = t(db)
	  , FormSection = defineFormSection(db)
	  , TestFormSectionGroup
	  , BusinessProcess = defineBusinessProcess(db)
	  , businessProcess, section;

	TestFormSectionGroup = FormSectionGroup.extend('TestFormSectionGroup', {
		actionUrl: { value: 'action' },
		resolventProperty: { value: 'prop0' },
		resolventValue: { value: true }
	});
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
			section: { type: TestFormSectionGroup, nested: true }
		}
	);
	businessProcess = new BusinessProcess();
	section = businessProcess.section;
	// setup children
	section.sections.define('firstSubSection', { type: FormSection });
	section.sections.firstSubSection.label = "First subsection";
	section.sections.firstSubSection.propertyNames = ['prop1'];

	section.sections.define('secondSubSection', { type: FormSection });
	section.sections.secondSubSection.label = "Second subsection";
	section.sections.secondSubSection.propertyNames = ['prop2', 'prop3'];
	//end setup children

	a(section.actionUrl, 'action');
	a(section.sections.size, 2);
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
	a(String(section.lastEditDate),
		String(new db.DateTime(businessProcess.$prop3.lastModified / 1000)));
};
