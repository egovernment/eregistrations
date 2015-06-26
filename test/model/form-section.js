'use strict';

var aFrom                 = require('es5-ext/array/from')
  , Database              = require('dbjs')
  , defineBusinessProcess = require('../../model/business-process/base')
  , defineDate            = require('dbjs-ext/date-time/date');

module.exports = function (t, a) {
	var db = new Database()
	  , FormSection = t(db)
	  , TestFormSection
	  , BusinessProcess = defineBusinessProcess(db)
	  , DateType = defineDate(db)
	  , businessProcess, section, Partner;

	TestFormSection = FormSection.extend('TestFormSection', {
		actionUrl: { value: 'action' },
		propertyNames: { value: ['prop1', 'prop2', 'prop3', 'partner/name',
			'partner/hasSameLastName', 'partner/lastName', 'otherObject/foo'] },
		resolventProperty: { value: 'prop0' },
		resolventValue: { value: true }
	});
	Partner = db.Object.extend('Partner', {
		name: { type: db.String, required: true },
		hasSameLastName: { type: db.Boolean, required: true },
		lastName: { type: db.String, required: true },
		isLastNameApplicable: { type: db.Boolean, value: function () {
			return this.hasSameLastName === false;
		} }
	});
	['isNameFormApplicable', 'isLastNameFormApplicable',
		'isHasSameLastNameFormApplicable'].forEach(function (name) {
		Partner.prototype.define(name, { type: db.Boolean, value: function (_observe) {
			return _observe(this.master._hasPartner);
		} });
	});
	//section's resolvent
	BusinessProcess.prototype.defineProperties(
		{
			hasPartner: { type: db.Boolean, value: false },
			prop0: {
				type: db.Boolean,
				required: true,
				value: false
			},
			prop1: { type: db.String, required: true },
			prop2: { type: db.Number },
			prop3: { type: db.Boolean, required: true },
			partner: { type: Partner, nested: true },
			section: { type: TestFormSection, nested: true },
			otherObj: { type: db.Object }
		}
	);
	businessProcess = new BusinessProcess();
	businessProcess.otherObject = new db.Object({ foo: 'bar' });
	section = businessProcess.section;
	a.deep(aFrom(section.resolvedPropertyNames),
		['prop1', 'prop2', 'prop3',
			'partner/name', 'partner/hasSameLastName',
			'partner/lastName', 'otherObject/foo']);
	a.deep(aFrom(section.formApplicablePropertyNames),
		['prop1', 'prop2', 'prop3', 'otherObject/foo']);
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
	businessProcess.hasPartner = true;
	a(section.weight, 4);
	a(section.status, 0.5);
	businessProcess.partner.name = 'test';
	a(section.weight, 4);
	a(section.status, 0.75);
	businessProcess.partner.hasSameLastName = true;
	a(section.weight, 4);
	a(section.status, 1);
	businessProcess.partner.hasSameLastName = false;
	a(section.status, 0.8);
	businessProcess.partner.lastName = 'test';
	a(section.status, 1);
};
