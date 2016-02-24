'use strict';

var defineBusinessProcess = require('../../model/business-process-new')
  , defineFormSection = require('../../model/form-section')
  , Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = defineBusinessProcess(db)
	  , FormSection = defineFormSection(db)

	  , businessProcess = new BusinessProcess(), businessProcess2 = new BusinessProcess()
	  , cumulatedSectionPaths = [];

	BusinessProcess.prototype.dataForms.map.define('main', {
		type: FormSection,
		nested: true
	});
	BusinessProcess.prototype.dataForms.map.main.setProperties({
		propertyNames: ['businessName', 'representative/email', 'submissionNumber/number']
	});

	businessProcess.dataForms.map.forEach(function (section) {
		if (section.propertyNames) {
			cumulatedSectionPaths = cumulatedSectionPaths.concat(section.propertyNames.toArray());
		}
	});
	a(t(businessProcess,  businessProcess2, cumulatedSectionPaths), undefined);
	a(businessProcess2.businessName, undefined);
	a(businessProcess2.representative.email, null);
	a(businessProcess2.submissionNumber.number, 0);
	businessProcess.businessName = 'Kamsi inc.';
	businessProcess.representative.email = 'kamsi@asd.com';
	businessProcess.submissionNumber.number = 13;
	t(businessProcess,  businessProcess2, cumulatedSectionPaths);
	a(businessProcess2.businessName, 'Kamsi inc.');
	a(businessProcess2.representative.email, 'kamsi@asd.com');
	a(businessProcess2.submissionNumber.number, 13);
	a.throws(function () { t(businessProcess,  businessProcess2, ['non-existing-path']); },
		new RegExp('Could not resolve path:'),
		'throws when given non existing path');
	t(businessProcess,  businessProcess2, [
		{ pathFrom: 'representative/email', pathTo: 'businessName' }]);
	a(businessProcess2.businessName, 'kamsi@asd.com');
};
