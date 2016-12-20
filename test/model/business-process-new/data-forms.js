'use strict';

var aFrom             = require('es5-ext/array/from')
  , Database          = require('dbjs')
  , defineFormSection = require('../../../model/form-section')
  , defineDerivedBusinessProcesses = require('../../../model/business-process-new/derived');

module.exports = function (t, a) {
	var db = new Database()
	  , FormSection = defineFormSection(db)
	  , BusinessProcess = t(db)
	  , businessProcess;

	defineDerivedBusinessProcesses(db);

	BusinessProcess.prototype.dataForms.map.defineProperties({
		test1: { nested: true, type: FormSection },
		test2: { nested: true, type: FormSection }
	});
	businessProcess = new BusinessProcess();
	a.deep(aFrom(businessProcess.dataForms.applicable),
		[businessProcess.dataForms.map.test1, businessProcess.dataForms.map.test2]);
	businessProcess.derivedBusinessProcess = new BusinessProcess();
	businessProcess.dataForms.map.test1.isApplicable = false;

	a(businessProcess.dataForms.status, undefined);
	a(businessProcess.dataForms.isRejected, false);

	businessProcess.dataForms.status = 'rejected';
	a(businessProcess.dataForms.status, 'rejected');
	a(businessProcess.dataForms.isRejected, false);

	businessProcess.dataForms.rejectReason = 'test';
	a(businessProcess.dataForms.isRejected, true);

	businessProcess.dataForms.status = 'approved';
	a(businessProcess.dataForms.isRejected, false);
};
