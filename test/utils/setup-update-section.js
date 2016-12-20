'use strict';

var defineBusinessProcess   = require('../../model/business-process-new')
  , defineFormSection       = require('../../model/form-section')
  , defineFormSectionGroup  = require('../../model/form-section-group')
  , defineFormSectionUpdate = require('../../model/form-section-update')
  , Database                = require('dbjs');

module.exports = function (t, a) {
	var db                = new Database()
	  , BusinessProcess   = defineBusinessProcess(db)
	  , FormSection       = defineFormSection(db)
	  , FormSectionGroup  = defineFormSectionGroup(db)
	  , FormSectionUpdate = defineFormSectionUpdate(db)
	  , updatePostfix     = FormSectionUpdate.updateSectionPostfix, businessUpdateProto;

	var BusinessProcessUpdate = BusinessProcess.extend('BusinessProcessUpdate', {
		previousProcess: {
			type: BusinessProcess,
			nested: true
		}
	});
	businessUpdateProto = BusinessProcessUpdate.prototype;

	BusinessProcess.prototype.dataForms.map.define('main', {
		type: FormSection,
		nested: true
	});
	BusinessProcess.prototype.dataForms.map.main.setProperties({
		propertyNames: ['businessName', 'representative/email', 'submissionNumber/number']
	});

	BusinessProcess.prototype.dataForms.map.define('mainGroup', {
		type: FormSectionGroup,
		nested: true
	});
	BusinessProcess.prototype.dataForms.map.mainGroup.sections.defineProperties({
		first: { type: FormSection, nested: true },
		second: { type: FormSection, nested: true }
	});

	BusinessProcess.prototype.dataForms.map.mainGroup.sections.first.setProperties({
		propertyNames: ['name', 'surname', 'address/street']
	});
	BusinessProcess.prototype.dataForms.map.mainGroup.sections.second.setProperties({
		propertyNames: ['idNumber']
	});

	a(businessUpdateProto.dataForms.map[updatePostfix], undefined);
	t(businessUpdateProto.dataForms.map.main);
	a(businessUpdateProto.dataForms.map['main' + updatePostfix].
			originalSourceSection.constructor, BusinessProcess.prototype.dataForms.map.main.constructor);
	a(businessUpdateProto.dataForms.map['main' + updatePostfix].constructor,
		FormSectionUpdate);
	a(businessUpdateProto.dataForms.map['main' + updatePostfix]
			.sourceSection.propertyMaster,
		businessUpdateProto);
	a(businessUpdateProto.dataForms.map['main' + updatePostfix]
			.originalSourceSection.propertyMaster,
		businessUpdateProto.previousProcess);

	t(businessUpdateProto.dataForms.map.mainGroup);
	a(businessUpdateProto.dataForms.map['mainGroup' + updatePostfix].constructor,
		FormSectionUpdate);
	a(businessUpdateProto.dataForms.map['mainGroup' + updatePostfix].sourceSection.propertyMaster,
		businessUpdateProto);
	a(businessUpdateProto.dataForms.map['mainGroup' + updatePostfix]
			.originalSourceSection.sections.first.propertyMaster,
		businessUpdateProto.previousProcess);

};
