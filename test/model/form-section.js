'use strict';

var aFrom    = require('es5-ext/array/from')
  , Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , FormSection = t(db)
	  , MasterTestFormSection = FormSection.extend('MasterTestFormSection')
	  , NestedTestFormSection = FormSection.extend('NestedTestFormSection')
	  , NestedType  = db.Object.extend('NestedType')
	  , MasterType  = db.Object.extend('MasterType')

	  , masterObject, nestedObject, section;

	// ------------------ Setup ------------------

	MasterTestFormSection.prototype.defineProperties({
		resolventProperty: {
			value: 'resolventProperty'
		},
		resolventValue: {
			value: true
		},
		propertyNames: {
			value: [
				'notRequiredProperty',
				'property',
				'secondProperty',
				'thirdProperty',
				'propertyWithDefaultValue',
				'propertyNotApplicable',
				'propertyNotFormApplicable',
				'nestedObject/notRequiredProperty',
				'nonExistentNestedObject/notRequiredProperty'
			]
		}
	});

	NestedTestFormSection.prototype.defineProperties({
		propertyMasterType: {
			value: NestedType
		},
		propertyNames: {
			value: [
				'notRequiredProperty'
			]
		}
	});

	NestedType.prototype.defineProperties({
		section: {
			type: NestedTestFormSection,
			nested: true
		},

		notRequiredProperty: {
			type: db.Object
		}
	});

	MasterType.prototype.defineProperties({
		nestedObject: {
			type: NestedType,
			nested: true
		},
		sectionWithDefaultValues: {
			type: FormSection,
			nested: true
		},
		sectionOfDerivedType: {
			type: MasterTestFormSection,
			nested: true
		},

		resolventProperty: {
			type: db.Boolean,
			required: true,
			value: false
		},
		notRequiredProperty: {
			type: db.Object
		},
		property: {
			type: db.Number,
			required: true
		},
		secondProperty: {
			type: db.Number,
			required: true
		},
		thirdProperty: {
			type: db.Number,
			required: true
		},
		propertyWithDefaultValue: {
			type: db.String,
			required: true,
			value: 'test value'
		},
		propertyNotApplicable: {
			type: db.Number,
			required: true
		},
		propertyNotFormApplicable: {
			type: db.Number,
			required: true
		},

		isPropertyNotApplicableApplicable: {
			type: db.Boolean,
			value: false
		},
		isPropertyNotFormApplicableFormApplicable: {
			type: db.Boolean,
			value: false
		},
		isThirdPropertyApplicable: {
			type: db.Boolean,
			value: true
		}
	});

	masterObject = new MasterType();
	nestedObject = masterObject.nestedObject;

	// ------------------ Tests ------------------

	a.h1('Basic properties');

	a.h2('Default values');
	section = masterObject.sectionWithDefaultValues;

	a(section.propertyNames.size, 0);

	a.h2('Properties overridden in derived class');
	section = masterObject.sectionOfDerivedType;

	a(section.propertyNames.size, 9);
	a.deep(aFrom(section.propertyNames), [
		'notRequiredProperty',
		'property',
		'secondProperty',
		'thirdProperty',
		'propertyWithDefaultValue',
		'propertyNotApplicable',
		'propertyNotFormApplicable',
		'nestedObject/notRequiredProperty',
		'nonExistentNestedObject/notRequiredProperty'
	]);

	a.h1('Getters');

	a.h2('With default values for other properties');
	section = masterObject.sectionWithDefaultValues;

	a(section.resolvedPropertyNames.size, 0);
	a(section.formApplicablePropertyNames.size, 0);
	a(section.applicablePropertyNames.size, 0);
	a(section.status, 1);
	a(section.missingRequiredPropertyNames.size, 0);
	a(section.weight, 0);
	a(section.lastEditStamp, 0);

	a.h2('With overridden properties in derived class');
	section = masterObject.sectionOfDerivedType;

	a.h3('resolvedPropertyNames');
	a(section.resolvedPropertyNames.size, 8);
	a.deep(aFrom(section.resolvedPropertyNames), [
		'notRequiredProperty',
		'property',
		'secondProperty',
		'thirdProperty',
		'propertyWithDefaultValue',
		'propertyNotApplicable',
		'propertyNotFormApplicable',
		'nestedObject/notRequiredProperty'
	]);
	var savedPropertyNames = aFrom(section.propertyNames);
	section.propertyNames = ['nonExistentProperty'];
	a.throws(function () {
		return section.resolvedPropertyNames;
	}, new RegExp("Could not find property: nonExistentProperty"), "errorTest");
	section.propertyNames = savedPropertyNames;

	a.h3('formApplicablePropertyNames');
	a(section.formApplicablePropertyNames.size, 7);
	a.deep(aFrom(section.formApplicablePropertyNames), [
		'notRequiredProperty',
		'property',
		'secondProperty',
		'thirdProperty',
		'propertyWithDefaultValue',
		'propertyNotApplicable',
		'nestedObject/notRequiredProperty'
	]);

	a.h3('applicablePropertyNames');
	a(section.applicablePropertyNames.size, 6);
	a.deep(aFrom(section.applicablePropertyNames), [
		'notRequiredProperty',
		'property',
		'secondProperty',
		'thirdProperty',
		'propertyWithDefaultValue',
		'nestedObject/notRequiredProperty'
	]);

	a.h3('status & missingRequiredPropertyNames');
	a(section.status, 1);
	a(section.missingRequiredPropertyNames.size, 0);

	masterObject.resolventProperty = true;
	a(section.status, 0);
	a(section.missingRequiredPropertyNames.size, 3);
	a.deep(aFrom(section.missingRequiredPropertyNames), [
		'property',
		'secondProperty',
		'thirdProperty'
	]);

	masterObject.property = 1;
	a(section.status, 0.33);
	a(section.missingRequiredPropertyNames.size, 2);
	a.deep(aFrom(section.missingRequiredPropertyNames), [
		'secondProperty',
		'thirdProperty'
	]);

	masterObject.resolventProperty = false;
	a(section.status, 1);
	a(section.missingRequiredPropertyNames.size, 0);

	masterObject.resolventProperty = true;
	masterObject.secondProperty = 1;
	a(section.status, 0.66);
	a(section.missingRequiredPropertyNames.size, 1);
	a.deep(aFrom(section.missingRequiredPropertyNames), [
		'thirdProperty'
	]);

	masterObject.isThirdPropertyApplicable = false;
	a(section.status, 1);
	a(section.missingRequiredPropertyNames.size, 0);
	masterObject.isThirdPropertyApplicable = true;
	a(section.status, 0.66);

	masterObject.thirdProperty = 1;
	a(section.status, 1);
	a(section.missingRequiredPropertyNames.size, 0);

	a.h3('weight');
	masterObject.resolventProperty = false;
	a(section.weight, 0);
	masterObject.resolventProperty = true;
	a(section.weight, 3);
	masterObject.isThirdPropertyApplicable = false;
	a(section.weight, 2);

	a.h3('lastEditStamp');
	masterObject.property = 1;
	a(String(section.lastEditDate),
		String(new db.DateTime(masterObject.$property.lastModified / 1000)));
	masterObject.thirdProperty = 1;
	a(String(section.lastEditDate),
		String(new db.DateTime(masterObject.$thirdProperty.lastModified / 1000)));

	a.h2('For section on nested object');
	section = nestedObject.section;

	a(section.resolvedPropertyNames.size, 1);
	a.deep(aFrom(section.resolvedPropertyNames), [
		'nestedObject/notRequiredProperty'
	]);
};
