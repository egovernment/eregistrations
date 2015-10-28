'use strict';

var Database              = require('dbjs')
  , defineBusinessProcess = require('../../model/business-process/base');

module.exports = function (t, a) {
	var db = new Database()
	  , FormSectionBase = t(db)
	  , BusinessProcess = defineBusinessProcess(db)
	  , TestFormSection
	  , MasterType
	  , master, businessProcess, section;

	// ------------------ Setup ------------------

	TestFormSection = FormSectionBase.extend('TestFormSection', {
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
			value: BusinessProcess
		},
		status: {
			value: 0.5
		},
		weight: {
			value: 2
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
		}
	});

	BusinessProcess.prototype.defineProperties({
		sectionWithDefaultValues: {
			type: FormSectionBase,
			nested: true
		},
		sectionOfDerivedType: {
			type: TestFormSection,
			nested: true
		}
	});

	MasterType = db.Object.extend('MasterType', {
		businessProcess: {
			type: BusinessProcess,
			nested: true
		},

		testResolventProperty: {
			type: db.Boolean
		},
		testRequiredResolventProperty: {
			type: db.Boolean,
			required: true
		},
		testRequiredWithDefaultValueResolventProperty: {
			type: db.Boolean,
			required: true,
			value: false
		}
	});

	master = new MasterType();
	businessProcess = master.businessProcess;

	// ------------------ Tests ------------------

	a.h1('Basic properties');

	// Testing default values may not seem like a bright idea. But suppose someone decides few
	// months from now that he'll change default value for 'status'. Now all the code that expects
	// classes derived from FormSectionBase to have a default status of 1 will be broken. We would
	// like to have a test showing that simple default value change can bring big impact on code.
	a.h2('Default values');
	section = businessProcess.sectionWithDefaultValues;

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

	a.h2('Properties overridden in derived class');
	section = businessProcess.sectionOfDerivedType;

	a(section.label, 'Test Label');
	a(section.legend, 'Test Legend');
	a(section.isApplicable, false);
	a(section.propertyMasterType, BusinessProcess);
	a(section.status, 0.5);
	a(section.weight, 2);
	a(section.resolventValue, true);
	a(section.onIncompleteMessage, 'Test Incomplete Message');
	a(section.lastEditStamp, 42);
	a(section.excludedFromStatusIfFilled.size, 1);
	a(section.excludedFromStatusIfFilled.has('testExcludedIfFilledField'), true);
	a(section.actionUrl, 'testActionUrl');
	a(section.resolventProperty, 'testResolventProperty');

	a.h1('Getters');

	a.h2('With default values for other properties');
	section = businessProcess.sectionWithDefaultValues;

	a(section.propertyMaster, master);
	a(section.isUnresolved, false);
	a(section.resolventStatus, 1);
	a(section.resolventWeight, 0);
	a(String(section.lastEditDate), String(new db.DateTime(0)));

	a.h2('With overridden properties in derived class');
	section = businessProcess.sectionOfDerivedType;

	a.h3('propertyMaster');
	a(section.propertyMaster, businessProcess);
	section.propertyMasterType = db.Number;
	a.throws(function () {
		return section.propertyMaster;
	}, new RegExp('Could not find propertyMaster of type Number'),
		'throws when given wrong propertyMasterType');
	section.propertyMasterType = MasterType;
	a(section.propertyMaster, master);

	a.h3('isUnresolved');
	a(section.isUnresolved, true);
	master.testResolventProperty = false;
	a(section.isUnresolved, true);
	master.testResolventProperty = true;
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
	master.testResolventProperty = false;
	a(section.resolventStatus, 1);
	master.testResolventProperty = true;
	a(section.resolventStatus, 1);
	a.h4('With required resolventProperty');
	section.resolventProperty = 'testRequiredResolventProperty';
	a(section.resolventStatus, 0);
	master.testRequiredResolventProperty = false;
	a(section.resolventStatus, 1);
	master.testRequiredResolventProperty = true;
	a(section.resolventStatus, 1);
	a.h4('With required resolventProperty with default value');
	section.resolventProperty = 'testRequiredWithDefaultValueResolventProperty';
	a(section.resolventStatus, 1);
	master.testRequiredWithDefaultValueResolventProperty = false;
	a(section.resolventStatus, 1);
	master.testRequiredWithDefaultValueResolventProperty = true;
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
	master.testResolventProperty = false;
	a(section.resolventWeight, 0);
	master.testResolventProperty = true;
	a(section.resolventWeight, 0);
	a.h4('With required resolventProperty');
	section.resolventProperty = 'testRequiredResolventProperty';
	a(section.resolventWeight, 1);
	master.testRequiredResolventProperty = false;
	a(section.resolventWeight, 1);
	master.testRequiredResolventProperty = true;
	a(section.resolventWeight, 1);
	a.h4('With required resolventProperty with default value');
	section.resolventProperty = 'testRequiredWithDefaultValueResolventProperty';
	a(section.resolventWeight, 0);
	master.testRequiredWithDefaultValueResolventProperty = false;
	a(section.resolventWeight, 0);
	master.testRequiredWithDefaultValueResolventProperty = true;
	a(section.resolventWeight, 0);
};
