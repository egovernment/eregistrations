'use strict';

var Database              = require('dbjs')
  , defineFormSection     = require('../../model/form-section');

module.exports = function (t, a) {
	var db = new Database()
	  , FormSectionGroup      = t(db)
	  , FormSection           = defineFormSection(db)
	  , TestFormSectionGroup  = FormSectionGroup.extend('TestFormSectionGroup')
	  , FirstTestFormSection  = FormSection.extend('FirstTestFormSection')
	  , SecondTestFormSection = FormSection.extend('SecondTestFormSection')
	  , MasterType            = db.Object.extend('MasterType')

	  , masterObject, section;

	// ------------------ Setup ------------------

	FirstTestFormSection.prototype.defineProperties({
		propertyNames: {
			value: [
				'propertyForFirstSection'
			]
		}
	});

	SecondTestFormSection.prototype.defineProperties({
		propertyNames: {
			value: [
				'propertyForSecondSection',
				'secondPropertyForSecondSection'
			]
		}
	});

	TestFormSectionGroup.prototype.defineProperties({
		resolventProperty: {
			value: 'resolventProperty'
		},
		resolventValue: {
			value: true
		}
	});

	TestFormSectionGroup.prototype.sections.defineProperties({
		firstSection: {
			type: FirstTestFormSection,
			nested: true
		},
		secondSection: {
			type: SecondTestFormSection,
			nested: true
		}
	});

	MasterType.prototype.defineProperties({
		sectionWithDefaultValues: {
			type: FormSectionGroup,
			nested: true
		},
		sectionOfDerivedType: {
			type: TestFormSectionGroup,
			nested: true
		},

		resolventProperty: {
			type: db.Boolean,
			required: true,
			value: false
		},
		propertyForFirstSection: {
			type: db.Number,
			required: true
		},
		propertyForSecondSection: {
			type: db.Number,
			required: true
		},
		secondPropertyForSecondSection: {
			type: db.Number,
			required: true
		}
	});

	masterObject = new MasterType();

	// ------------------ Tests ------------------

	a.h1('Basic properties');

	a.h2('Default values');
	section = masterObject.sectionWithDefaultValues;

	a(section.sections.size, 0);

	a.h2('Properties overridden in derived class');
	section = masterObject.sectionOfDerivedType;

	a(section.sections.size, 2);

	a.h1('Getters');

	a.h2('With default values for other properties');
	section = masterObject.sectionWithDefaultValues;

	a(section.status, 1);
	a(section.weight, 0);
	a(section.lastEditStamp, 0);

	a.h2('With overridden properties in derived class');
	section = masterObject.sectionOfDerivedType;

	a.h3('status');
	a(section.status, 1);

	masterObject.resolventProperty = true;
	a(section.status, 0);
	masterObject.propertyForFirstSection = 1;
	a(section.status, 0.33);
	masterObject.propertyForSecondSection = 1;
	a(section.status, 0.66);
	masterObject.secondPropertyForSecondSection = 1;
	a(section.status, 1);

	a.h3('weight');
	masterObject.resolventProperty = false;
	a(section.weight, 0);
	masterObject.resolventProperty = true;
	a(section.weight, 3);

	a.h3('lastEditStamp');
	masterObject.propertyForFirstSection = 1;
	a(section.lastEditStamp, masterObject.$propertyForFirstSection.lastModified);
	masterObject.resolventProperty = false;
	a(section.lastEditStamp, masterObject.$resolventProperty.lastModified);
	masterObject.secondPropertyForSecondSection = 1;
	a(section.lastEditStamp, masterObject.$secondPropertyForSecondSection.lastModified);
};
