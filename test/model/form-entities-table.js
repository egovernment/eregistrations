'use strict';

var Database              = require('dbjs')
  , defineBusinessProcess = require('../../model/business-process/base')
  , defineFormSection     = require('../../model/form-section')
  , defineFormSections    = require('../../model/form-sections');

module.exports = function (t, a) {
	var db = new Database()
	  , FormEntitiesTable = t(db)
	  , TestFormEntitiesTable
	  , Partner
	  , FormSection = defineFormSection(db)
	  , BusinessProcess = defineBusinessProcess(db)
	  , businessProcess, section;

	TestFormEntitiesTable = FormEntitiesTable.extend('TestFormEntitiesTable', {
		resolventProperty: { value: 'tableResolver' },
		resolventValue: { value: true },
		actionUrl: { value: 'action' },
		sectionProperty: { value: 'dataForms' },
		propertyName: { value: 'partners' },
		min: { value: 1 },
		max: { value: 3 }
	});

	Partner = db.Object.extend('Partner', {
		prop1: { type: db.String, required: true },
		prop2: { type: db.Number },
		prop3: { type: db.Boolean, required: true }
	});

	defineFormSections(Partner, 'dataForms');

	Partner.prototype.dataForms.define('partnerSection', { type: FormSection });
	Partner.prototype.dataForms.partnerSection.propertyNames = ['prop1', 'prop2', 'prop3'];

	//section's resolvent
	BusinessProcess.prototype.defineProperties(
		{
			tableResolver: { type: db.Boolean, value: true },
			partners: { type: Partner, multiple: true },
			section: { type: TestFormEntitiesTable, nested: true }
		}
	);

	businessProcess = new BusinessProcess();
	section = businessProcess.section;
	a(section.actionUrl, 'action');
	a(section.weight, 2);
	a(section.status, 0);
	businessProcess.partners.add(new Partner());
	businessProcess.partners.first.prop1 = 'test';
	a(section.status, 0.5);
	businessProcess.partners.first.prop3 = true;
	a(section.status, 1);
	a(String(section.lastEditDate), String(
		new db.DateTime(businessProcess.partners.first.getDescriptor('prop3').lastModified / 1000)
	));
	section.min = 2;
	a(section.status, 0.5);
	businessProcess.partners.add(new Partner());
	businessProcess.partners.last.prop1 = 'test';
	a(section.status, 0.75);
	businessProcess.partners.last.prop3 = false;
	a(section.status, 1);
	businessProcess.partners.add(new Partner());
	businessProcess.partners.last.prop1 = 'test';
	a(section.status, 0.8300000000000001);
	a(section.weight, 6);
	businessProcess.partners.last.prop3 = false;
	a(section.status, 1);
	businessProcess.partners.add(new Partner());
	a(section.weight, 7);
	a(section.status, 0.85);
	businessProcess.tableResolver = false;
	a(section.weight, 0);
	a(section.status, 1);
	a(String(section.lastEditDate), String(
		new db.DateTime(businessProcess.getDescriptor('tableResolver').lastModified / 1000)
	));
	businessProcess.tableResolver = true;
	section.max = 2;
	a(section.weight, 6);
	a(section.status, 0.66);
	section.max = 4;
	businessProcess.partners.last.prop1 = 'test';
	businessProcess.partners.last.prop3 = true;
	a(section.weight, 8);
	a(section.status, 1);
};
