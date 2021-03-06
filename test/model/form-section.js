'use strict';

var aFrom                  = require('es5-ext/array/from')
  , Database               = require('dbjs')
  , defineConstrainedValue = require('../../model/constrained-value')
  , defineBase             = require('../../model/base');

module.exports = function (t, a) {
	var db = new Database()
	  , FormSection = t(db)
	  , MasterTestFormSection = FormSection.extend('MasterTestFormSection')
	  , NestedTestFormSection = FormSection.extend('NestedTestFormSection')
	  , NestedType  = db.Object.extend('NestedType')
	  , MasterType  = db.Object.extend('MasterType')

	  , masterObject, nestedObject, section;

	// needed for jsonification tests
	defineBase(db);

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
			type: db.Number
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
			type: db.Number
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
			min: function () { return 0; },
			max: function () { return 50000; }
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
	a(section.hasMissingRequiredPropertyNamesDeep, false);
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

	a.h3('status & property value resolution');
	a(section.status, 1);
	a(section.missingRequiredPropertyNames.size, 0);
	a(section.hasMissingRequiredPropertyNamesDeep, false);
	a(section.filledPropertyNames.size, 1);
	a.deep(aFrom(section.filledPropertyNames), [
		'resolventProperty'
	]);

	masterObject.resolventProperty = true;
	a(section.status, 0);
	a(section.missingRequiredPropertyNames.size, 4);
	a(section.hasMissingRequiredPropertyNamesDeep, true);
	a.deep(aFrom(section.missingRequiredPropertyNames), [
		'property',
		'secondProperty',
		'thirdProperty',
		'constrainedProperty'
	]);
	a(section.filledPropertyNames.size, 2);
	a.deep(aFrom(section.filledPropertyNames), [
		'resolventProperty',
		'propertyWithDefaultValue'
	]);

	masterObject.property = 1;
	a(section.status, 0.25);
	a(section.missingRequiredPropertyNames.size, 3);
	a(section.hasMissingRequiredPropertyNamesDeep, true);
	a.deep(aFrom(section.missingRequiredPropertyNames), [
		'secondProperty',
		'thirdProperty',
		'constrainedProperty'
	]);
	a(section.filledPropertyNames.size, 3);
	a.deep(aFrom(section.filledPropertyNames), [
		'resolventProperty',
		'property',
		'propertyWithDefaultValue'
	]);

	masterObject.resolventProperty = false;
	a(section.status, 1);
	a(section.missingRequiredPropertyNames.size, 0);
	a(section.hasMissingRequiredPropertyNamesDeep, false);
	a(section.filledPropertyNames.size, 1);

	masterObject.resolventProperty = true;
	masterObject.secondProperty = 1;
	a(section.status, 0.5);
	a(section.missingRequiredPropertyNames.size, 2);
	a(section.hasMissingRequiredPropertyNamesDeep, true);
	a.deep(aFrom(section.missingRequiredPropertyNames), [
		'thirdProperty',
		'constrainedProperty'
	]);
	a(section.filledPropertyNames.size, 4);
	a.deep(aFrom(section.filledPropertyNames), [
		'resolventProperty',
		'property',
		'secondProperty',
		'propertyWithDefaultValue'
	]);

	masterObject.isThirdPropertyApplicable = false;
	a(section.status, 0.66);
	a(section.missingRequiredPropertyNames.size, 1);
	a(section.hasMissingRequiredPropertyNamesDeep, true);
	masterObject.isThirdPropertyApplicable = true;

	a(section.status, 0.5);
	masterObject.thirdProperty = 1;
	a(section.filledPropertyNames.size, 5);
	a.deep(aFrom(section.filledPropertyNames), [
		'resolventProperty',
		'property',
		'secondProperty',
		'thirdProperty',
		'propertyWithDefaultValue'
	]);

	a(section.status, 0.75);
	a(section.missingRequiredPropertyNames.size, 1);
	a(section.hasMissingRequiredPropertyNamesDeep, true);
	a.deep(aFrom(section.missingRequiredPropertyNames), [
		'constrainedProperty'
	]);
	masterObject.constrainedProperty.value = 1500;

	a(section.status, 1);
	a(section.missingRequiredPropertyNames.size, 0);
	a(section.hasMissingRequiredPropertyNamesDeep, false);
	a(section.filledPropertyNames.size, 6);
	a.deep(aFrom(section.filledPropertyNames), [
		'resolventProperty',
		'property',
		'secondProperty',
		'thirdProperty',
		'propertyWithDefaultValue',
		'constrainedProperty'
	]);

	masterObject.notRequiredProperty = 1;
	a(section.filledPropertyNames.size, 7);
	a.deep(aFrom(section.filledPropertyNames), [
		'resolventProperty',
		'notRequiredProperty',
		'property',
		'secondProperty',
		'thirdProperty',
		'propertyWithDefaultValue',
		'constrainedProperty'
	]);

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

	a.h2('propertyNamesDeep');
	section = masterObject.sectionOfDerivedType;
	a.deep(aFrom(section.propertyNamesDeep), ['notRequiredProperty',
		'property',
		'secondProperty',
		'thirdProperty',
		'propertyWithDefaultValue',
		'propertyNotApplicable',
		'propertyNotFormApplicable',
		'nestedObject/notRequiredProperty',
		'nonExistentNestedObject/notRequiredProperty',
		'readOnlyPropertyName',
		'constrainedProperty',
		'resolventProperty']);

	// section unresoved
	a.deep(section.toWebServiceJSON(), { resolventProperty: false });
	masterObject.resolventProperty = true;
	a.deep(section.toWebServiceJSON(),
		{
			resolventProperty: true,
			notRequiredProperty: 1,
			property: 1,
			secondProperty: 1,
			propertyWithDefaultValue: 'test value',
			constrainedProperty: '1,500'
		});

	nestedObject.notRequiredProperty = 5;
	a.deep(section.toWebServiceJSON(),
		{
			resolventProperty: true,
			notRequiredProperty: 1,
			property: 1,
			secondProperty: 1,
			propertyWithDefaultValue: 'test value',
			constrainedProperty: '1,500',
			nestedObject: {
				notRequiredProperty: 5
			}
		});

	nestedObject.define('otherNested', {
		type: db.Object,
		nested: true
	});

	nestedObject.otherNested.define('reallyNestedProp', {
		type: db.Number
	});

	nestedObject.otherNested.reallyNestedProp = 8;
	section.propertyNames.add('nestedObject/otherNested/reallyNestedProp');

	a.deep(section.toWebServiceJSON(),
		{
			resolventProperty: true,
			notRequiredProperty: 1,
			property: 1,
			secondProperty: 1,
			propertyWithDefaultValue: 'test value',
			constrainedProperty: '1,500',
			nestedObject: {
				notRequiredProperty: 5,
				otherNested: {
					reallyNestedProp: 8
				}
			}
		});

	a(section.filledPropertyNames.size, 8);
	a.deep(aFrom(section.filledPropertyNames), [
		'resolventProperty',
		'notRequiredProperty',
		'property',
		'secondProperty',
		'propertyWithDefaultValue',
		'nestedObject/notRequiredProperty',
		'constrainedProperty',
		'nestedObject/otherNested/reallyNestedProp'
	]);
	masterObject.constrainedProperty.value = 0;

	a(section.filledPropertyNames.size, 8);
	a.deep(aFrom(section.filledPropertyNames), [
		'resolventProperty',
		'notRequiredProperty',
		'property',
		'secondProperty',
		'propertyWithDefaultValue',
		'nestedObject/notRequiredProperty',
		'constrainedProperty',
		'nestedObject/otherNested/reallyNestedProp'
	]);

	masterObject.constrainedProperty.value = null;

	a(section.filledPropertyNames.size, 7);
	a.deep(aFrom(section.filledPropertyNames), [
		'resolventProperty',
		'notRequiredProperty',
		'property',
		'secondProperty',
		'propertyWithDefaultValue',
		'nestedObject/notRequiredProperty',
		'nestedObject/otherNested/reallyNestedProp'
	]);
};
