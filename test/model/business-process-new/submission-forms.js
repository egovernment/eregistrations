'use strict';

var aFrom             = require('es5-ext/array/from')
  , Database          = require('dbjs')
  , defineFormSection = require('../../../model/form-section');

module.exports = function (t, a) {
	var db = new Database()
	  , FormSection = defineFormSection(db)
	  , BusinessProcess = t(db)
	  , businessProcess;

	var FormSection1 = FormSection.extend('FormSection1');
	FormSection.prototype.propertyNames = ['foo'];
	BusinessProcess.prototype.submissionForms.map.defineProperties({
		test1: { nested: true, type: FormSection1 }
	});
	BusinessProcess.prototype.defineProperties({ foo: { required: true } });

	businessProcess = new BusinessProcess();
	a.deep(aFrom(businessProcess.submissionForms.applicable),
		[businessProcess.submissionForms.map.test1]);
	a(businessProcess.submissionForms.progress, 0);
	a(businessProcess.submissionForms.weight, 2);

	businessProcess.foo = true;
	a(businessProcess.submissionForms.progress, 0.5);
	a(businessProcess.submissionForms.weight, 2);

	businessProcess.submissionForms.isAffidavitSigned = true;
	a(businessProcess.submissionForms.progress, 1);
	a(businessProcess.submissionForms.weight, 2);
};
