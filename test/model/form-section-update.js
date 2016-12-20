'use strict';

var Database               = require('dbjs')
  , defineFormSection      = require('../../model/form-section')
  , defineFormSectionGroup = require('../../model/form-section-group')
  , aFrom                  = require('es5-ext/array/from');

module.exports = function (t, a) {
	var db = new Database()
	  , FormSectionUpdate     = t(db)
	  , FormSection           = defineFormSection(db)
	  , FormSectionGroup      = defineFormSectionGroup(db)
	  , TestFormSectionGroup  = FormSectionGroup.extend('TestFormSectionGroup')
	  , FirstTestFormSection  = FormSection.extend('FirstTestFormSection')
	  , SecondTestFormSection = FormSection.extend('SecondTestFormSection')
	  , BusinessProcess       = db.Object.extend('BusinessProcess')
	  , BusinessProcessUpdate = BusinessProcess.extend('BusinessProcessUpdate', {
		previousProcess: {
			type: BusinessProcess,
			nested: true
		}
	})
	  , businessProcessUpdate = new BusinessProcessUpdate()
	  , section;

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

	BusinessProcess.prototype.defineProperties({
		groupSection: {
			type: FormSectionGroup,
			nested: true
		},
		formSection: {
			type: FirstTestFormSection,
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

	BusinessProcessUpdate.prototype.define('formSection' + FormSectionUpdate.updateSectionPostfix, {
		type: FormSectionUpdate,
		nested: true
	});

	// ------------------ Tests ------------------

	a.h1('Source is FormSection');

	section = businessProcessUpdate['formSection' + FormSectionUpdate.updateSectionPostfix];

	a(section.sourceSection, businessProcessUpdate.formSection);
	a(section.originalSourceSection, businessProcessUpdate.previousProcess.formSection);
	a.deep(aFrom(section.sourceSection.propertyNames),
		aFrom(section.originalSourceSection.propertyNames));
	a(section.sourceSection.status, 0);
	a(section.originalSourceSection.status, 0);
};
