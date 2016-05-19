'use strict';

var defineBusinessProcess = require('../../model/business-process-new')
  , defineFormSection     = require('../../model/form-section')
  , defineGroupSection    = require('../../model/form-section-group')
  , Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = defineBusinessProcess(db)
	  , FormSection     = defineFormSection(db)
	  , GroupSection    = defineGroupSection(db)

	  , businessProcess = new BusinessProcess()
	  , properties = [];

	BusinessProcess.prototype.dataForms.map.define('main', {
		type: FormSection,
		nested: true
	});
	BusinessProcess.prototype.dataForms.map.main.setProperties({
		propertyNames: ['businessName', 'representative/email', 'submissionNumber/number']
	});

	BusinessProcess.prototype.dataForms.map.define('mainGroup', {
		type: GroupSection,
		nested: true
	});
	BusinessProcess.prototype.dataForms.map.mainGroup.sections.defineProperties({
		first: {
			type: FormSection,
			nested: true
		},
		second: {
			type: FormSection,
			nested: true
		}
	});

	BusinessProcess.prototype.dataForms.map.mainGroup.sections.first.setProperties({
		propertyNames: ['businessName']
	});

	BusinessProcess.prototype.dataForms.map.mainGroup.sections.second.setProperties({
		propertyNames: ['representative/email', 'submissionNumber/number']
	});

	businessProcess.businessName            = 'test';
	businessProcess.representative.email    = 'test@asd.com';
	businessProcess.submissionNumber.number = 123;
	t(businessProcess.dataForms.map.main, properties);
	a.deep(properties, ['businessName', 'representative/email', 'submissionNumber/number']);
	properties = [];
	t(businessProcess.dataForms.map.mainGroup, properties);
	a.deep(properties, ['businessName', 'representative/email', 'submissionNumber/number']);
};
