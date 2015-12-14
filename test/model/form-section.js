'use strict';

var aFrom                  = require('es5-ext/array/from')
  , Database               = require('dbjs')
  , defineConstrainedValue = require('../../model/constrained-value');

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
				'nonExistentNestedObject/notRequiredProperty',
				'readOnlyPropertyName',
				'constrainedProperty'
			]
		},
		readOnlyPropertyNames: {
			value: [
				'readOnlyPropertyName'
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
		readOnlyPropertyName: {
			type: db.Number,
			required: true
		},
		constrainedProperty: {
			type: db.Object,
			nested: true,
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

	defineConstrainedValue(MasterType.prototype.constrainedProperty, db.Number, {
		dynamicConstraints: {
			min: function () { return 1000; }
		}
	});

	masterObject = new MasterType();
	nestedObject = masterObject.nestedObject;

	// ------------------ Tests ------------------

	a.h1('Basic properties');

	a.h2('Default values');
	section = masterObject.sectionWithDefaultValues;

	a(section.propertyNames.size, 0);
	a(section.readOnlyPropertyNames.size, 0);

	a.h2('Properties overridden in derived class');
	section = masterObject.sectionOfDerivedType;

	a(section.propertyNames.size, 11);
	a.deep(aFrom(section.propertyNames), [
		'notRequiredProperty',
		'property',
		'secondProperty',
		'thirdProperty',
		'propertyWithDefaultValue',
		'propertyNotApplicable',
		'propertyNotFormApplicable',
		'nestedObject/notRequiredProperty',
		'nonExistentNestedObject/notRequiredProperty',
		'readOnlyPropertyName',
		'constrainedProperty'
	]);
	a(section.readOnlyPropertyNames.size, 1);
	a.deep(aFrom(section.readOnlyPropertyNames), [
		'readOnlyPropertyName'
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
	a(section.resolvedPropertyNames.size, 10);
	a.deep(aFrom(section.resolvedPropertyNames), [
		'notRequiredProperty',
		'property',
		'secondProperty',
		'thirdProperty',
		'propertyWithDefaultValue',
		'propertyNotApplicable',
		'propertyNotFormApplicable',
		'nestedObject/notRequiredProperty',
		'readOnlyPropertyName',
		'constrainedProperty'
	]);
	var savedPropertyNames = aFrom(section.propertyNames);
	section.propertyNames = ['nonExistentProperty'];
	a.throws(function () {
		return section.resolvedPropertyNames;
	}, new RegExp("Could not find property: nonExistentProperty"), "errorTest");
	section.propertyNames = savedPropertyNames;

	a.h3('formApplicablePropertyNames');
	a(section.formApplicablePropertyNames.size, 9);
	a.deep(aFrom(section.formApplicablePropertyNames), [
		'notRequiredProperty',
		'property',
		'secondProperty',
		'thirdProperty',
		'propertyWithDefaultValue',
		'propertyNotApplicable',
		'nestedObject/notRequiredProperty',
		'readOnlyPropertyName',
		'constrainedProperty'
	]);

	a.h3('applicablePropertyNames');
	a(section.applicablePropertyNames.size, 8);
	a.deep(aFrom(section.applicablePropertyNames), [
		'notRequiredProperty',
		'property',
		'secondProperty',
		'thirdProperty',
		'propertyWithDefaultValue',
		'nestedObject/notRequiredProperty',
		'readOnlyPropertyName',
		'constrainedProperty'
	]);

	a.h3('status & missingRequiredPropertyNames');
	a(section.status, 1);
	a(section.missingRequiredPropertyNames.size, 0);

	masterObject.resolventProperty = true;
	a(section.status, 0);
	a(section.missingRequiredPropertyNames.size, 4);
	a.deep(aFrom(section.missingRequiredPropertyNames), [
		'property',
		'secondProperty',
		'thirdProperty',
		'constrainedProperty'
	]);

	masterObject.property = 1;
	a(section.status, 0.25);
	a(section.missingRequiredPropertyNames.size, 3);
	a.deep(aFrom(section.missingRequiredPropertyNames), [
		'secondProperty',
		'thirdProperty',
		'constrainedProperty'
	]);

	masterObject.resolventProperty = false;
	a(section.status, 1);
	a(section.missingRequiredPropertyNames.size, 0);

	masterObject.resolventProperty = true;
	masterObject.secondProperty = 1;
	a(section.status, 0.5);
	a(section.missingRequiredPropertyNames.size, 2);
	a.deep(aFrom(section.missingRequiredPropertyNames), [
		'thirdProperty',
		'constrainedProperty'
	]);

	masterObject.isThirdPropertyApplicable = false;
	a(section.status, 0.66);
	a(section.missingRequiredPropertyNames.size, 1);
	masterObject.isThirdPropertyApplicable = true;

	a(section.status, 0.5);
	masterObject.thirdProperty = 1;

	a(section.status, 0.75);
	a(section.missingRequiredPropertyNames.size, 1);
	a.deep(aFrom(section.missingRequiredPropertyNames), [
		'constrainedProperty'
	]);
	masterObject.constrainedProperty.value = 1500;

	a(section.status, 1);
	a(section.missingRequiredPropertyNames.size, 0);

	a.h3('weight');
	masterObject.resolventProperty = false;
	a(section.weight, 0);
	masterObject.resolventProperty = true;
	a(section.weight, 4);
	masterObject.isThirdPropertyApplicable = false;
	a(section.weight, 3);

	a.h3('lastEditStamp');
	masterObject.property = 1;
	a(section.lastEditStamp, masterObject.$property.lastModified);
	masterObject.resolventProperty = false;
	a(section.lastEditStamp, masterObject.$resolventProperty.lastModified);
	masterObject.secondProperty = 1;
	a(section.lastEditStamp, masterObject.$secondProperty.lastModified);

	a.h2('For section on nested object');
	section = nestedObject.section;

	a(section.resolvedPropertyNames.size, 1);
	a.deep(aFrom(section.resolvedPropertyNames), [
		'nestedObject/notRequiredProperty'
	]);
};
