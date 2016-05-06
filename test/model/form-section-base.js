'use strict';

var Database           = require('dbjs')
  , defineProgressRule = require('../../model/lib/progress-rule')
  , defineNestedMap    = require('../../model/lib/nested-map');

module.exports = function (t, a) {
	var db              = new Database()
	  , FormSectionBase = t(db)
	  , TestFormSection = FormSectionBase.extend('TestFormSection')
	  , ProgressRule    = defineProgressRule(db)
	  , NestedMap       = defineNestedMap(db)
	  , NestedType      = db.Object.extend('NestedType')
	  , MasterType      = db.Object.extend('MasterType')

	  , masterObject, nestedObject, section;

	// ------------------ Setup ------------------

	TestFormSection.prototype.defineProperties({
		label: {
			value: 'Test Label'
		},
		legend: {
			value: 'Test Legend'
		},
		isApplicable: {
			value: false
		},
		propertyMasterType: {
			value: NestedType
		},
		resolventValue: {
			value: true
		},
		onIncompleteMessage: {
			value: 'Test Incomplete Message'
		},
		lastEditStamp: {
			value: 42
		},
		excludedFromStatusIfFilled: {
			value: ['testExcludedIfFilledField']
		},
		actionUrl: {
			value: 'testActionUrl'
		},
		resolventProperty: {
			value: 'testResolventProperty'
		},
		pageUrl: {
			value: 'test-page-url'
		}
	});

	TestFormSection.prototype.progressRules.map.define('progressRule', {
		type: ProgressRule,
		nested: true
	});

	TestFormSection.prototype.progressRules.map.progressRule.setProperties({
		progress: 1,
		weight: 0
	});

	NestedType.prototype.defineProperties({
		sectionWithDefaultValues: {
			type: FormSectionBase,
			nested: true
		},
		sectionOfDerivedType: {
			type: TestFormSection,
			nested: true
		}
	});

	MasterType.prototype.defineProperties({
		nestedObject: {
			type: NestedType,
			nested: true
		},

		testResolventProperty: {
			type: db.Boolean
		},
		testRequiredResolventProperty: {
			type: db.Boolean,
			required: true
		},
		testRequiredResolventProperty2: {
			type: db.Boolean,
			required: true
		},
		testRequiredWithDefaultValueResolventProperty: {
			type: db.Boolean,
			required: true,
			value: false
		},
		testNestedMapProperty: {
			type: NestedMap,
			nested: true
		}
	});

	MasterType.prototype.testNestedMapProperty.getOwnDescriptor('map').required = true;

	masterObject = new MasterType();
	nestedObject = masterObject.nestedObject;

	// ------------------ Tests ------------------

	a.h1('Basic properties');

	// Testing default values may not seem like a bright idea. But suppose someone decides few
	// months from now that he'll change default value for 'status'. Now all the code that expects
	// classes derived from FormSectionBase to have a default status of 1 will be broken. We would
	// like to have a test showing that simple default value change can bring big impact on code.
	a.h2('Default values');
	section = nestedObject.sectionWithDefaultValues;

	a(section.label, undefined);
	a(section.legend, undefined);
	a(section.isApplicable, true);
	a(section.propertyMasterType, undefined);
	a(section.status, 1);
	a(section.weight, 0);
	a(section.resolventValue, undefined);
	a(section.onIncompleteMessage, undefined);
	a(section.lastEditStamp, 0);
	a(section.excludedFromStatusIfFilled.size, 0);
	a(section.actionUrl, undefined);
	a(section.resolventProperty, undefined);
	a(section.hasMissingRequiredPropertyNamesDeep, undefined);
	a(section.pageUrl, undefined);

	a.h2('Properties overridden in derived class');
	section = nestedObject.sectionOfDerivedType;

	a(section.label, 'Test Label');
	a(section.legend, 'Test Legend');
	a(section.isApplicable, false);
	a(section.propertyMasterType, NestedType);
	a(section.resolventValue, true);
	a(section.onIncompleteMessage, 'Test Incomplete Message');
	a(section.lastEditStamp, 42);
	a(section.excludedFromStatusIfFilled.size, 1);
	a(section.excludedFromStatusIfFilled.has('testExcludedIfFilledField'), true);
	a(section.actionUrl, 'testActionUrl');
	a(section.resolventProperty, 'testResolventProperty');
	a(section.pageUrl, 'test-page-url');

	a.h1('Getters');

	a.h2('With default values for other properties');
	section = nestedObject.sectionWithDefaultValues;

	a(section.propertyMaster, masterObject);
	a(section.isUnresolved, false);
	a(section.resolventStatus, 1);
	a(section.resolventWeight, 0);
	a(section.status, 1);
	a(section.weight, 0);
	a(String(section.lastEditDate), String(new db.Date(0)));

	a.h2('With overridden properties in derived class');
	section = nestedObject.sectionOfDerivedType;

	a.h3('propertyMaster');
	a(section.propertyMaster, nestedObject);
	section.propertyMasterType = db.Number;
	a.throws(function () {
		return section.propertyMaster;
	}, new RegExp('Could not find propertyMaster of type Number'),
		'throws when given wrong propertyMasterType');
	section.propertyMasterType = MasterType;
	a(section.propertyMaster, masterObject);

	a.h3('isUnresolved');
	a(section.isUnresolved, true);
	masterObject.testResolventProperty = false;
	a(section.isUnresolved, true);
	masterObject.testResolventProperty = true;
	a(section.isUnresolved, false);
	section.resolventProperty = 'nonExistentPropertyName';
	a.throws(function () {
		return section.isUnresolved;
	}, new RegExp('Could not find resolventProperty: nonExistentPropertyName'),
		'throws when given wrong resolventProperty');

	a.h3('resolventStatus');
	section.resolventProperty = 'nonExistentPropertyName';
	a.throws(function () {
		return section.resolventStatus;
	}, new RegExp('Could not find resolventProperty: nonExistentPropertyName'),
		'throws when given wrong resolventProperty');
	a.h4('With not required resolventProperty');
	section.resolventProperty = 'testResolventProperty';
	a(section.resolventStatus, 1);
	masterObject.testResolventProperty = false;
	a(section.resolventStatus, 1);
	masterObject.testResolventProperty = true;
	a(section.resolventStatus, 1);
	a.h4('With required resolventProperty');
	section.resolventProperty = 'testRequiredResolventProperty';
	a(section.resolventStatus, 0);
	masterObject.testRequiredResolventProperty = false;
	a(section.resolventStatus, 1);
	masterObject.testRequiredResolventProperty = true;
	a(section.resolventStatus, 1);
	a.h4('With required resolventProperty with default value');
	section.resolventProperty = 'testRequiredWithDefaultValueResolventProperty';
	a(section.resolventStatus, 1);
	masterObject.testRequiredWithDefaultValueResolventProperty = false;
	a(section.resolventStatus, 1);
	masterObject.testRequiredWithDefaultValueResolventProperty = true;
	a(section.resolventStatus, 1);

	a.h3('resolventWeight');
	section.resolventProperty = 'nonExistentPropertyName';
	a.throws(function () {
		return section.resolventWeight;
	}, new RegExp('Could not find resolventProperty: nonExistentPropertyName'),
		'throws when given wrong resolventProperty');
	a.h4('With not required resolventProperty');
	section.resolventProperty = 'testResolventProperty';
	a(section.resolventWeight, 0);
	masterObject.testResolventProperty = false;
	a(section.resolventWeight, 0);
	masterObject.testResolventProperty = true;
	a(section.resolventWeight, 0);
	a.h4('With required resolventProperty');
	section.resolventProperty = 'testRequiredResolventProperty';
	masterObject.testRequiredResolventProperty = false;
	a(section.resolventWeight, 1);
	masterObject.testRequiredResolventProperty = true;
	a(section.resolventWeight, 1);
	a.h4('With required resolventProperty with default value');
	section.resolventProperty = 'testRequiredWithDefaultValueResolventProperty';
	a(section.resolventWeight, 0);
	masterObject.testRequiredWithDefaultValueResolventProperty = false;
	a(section.resolventWeight, 0);
	masterObject.testRequiredWithDefaultValueResolventProperty = true;
	a(section.resolventWeight, 0);
	a.h4('With nested map property');
	section.resolventProperty = 'testNestedMapProperty/map';
	a(section.resolventWeight, 1);

	a.h3('weight');
	section.resolventProperty = 'testResolventProperty';
	masterObject.testResolventProperty = true;
	section.progressRules.weight = 3;
	a(section.weight, 3);
	section.resolventProperty = 'testRequiredResolventProperty';
	masterObject.testRequiredResolventProperty = true;
	a(section.weight, 4);

	a.h3('status');
	section.resolventProperty = 'testResolventProperty';
	masterObject.testResolventProperty = false;
	section.progressRules.weight   = 4;
	section.progressRules.progress = 0.5;
	a(section.status, 1);
	masterObject.testResolventProperty = true;
	a(section.status, 0.5);
	section.resolventProperty = 'testRequiredResolventProperty2';
	a(section.status, 0);
	masterObject.testRequiredResolventProperty2 = true;
	a(section.status, 0.6);

	a.h1('Neighbourhood');
	a(section.nextSection, null);
	a(section.previousSection, null);
};
