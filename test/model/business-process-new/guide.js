'use strict';

var Database              = require('dbjs')
  , defineFormSection     = require('../../../model/form-section')
  , defineMapCertificates
	= require('../../../model/business-process-new/utils/define-certificates');

module.exports = function (t, a) {
	var db = new Database()
	  , FormSection = defineFormSection(db)
	  , BusinessProcess = t(db)

	  , businessProcess;

	var FormSection1 = FormSection.extend('FormSection1');
	FormSection.prototype.propertyNames = ['foo'];
	var TestDocument = db.Document.extend('Test', { dataForm: { type: FormSection1 } }, {
		label: { value: "Test document" }
	});

	BusinessProcess.prototype.defineProperties({ foo: { required: true } });

	BusinessProcess.prototype.requirements.map.define('req', { nested: true });
	BusinessProcess.prototype.requirements.map.req.defineProperties({
		Document: { value: TestDocument },
		guideProgress: { value: 0 }
	});

	BusinessProcess.prototype.registrations.map.define('test', { nested: true });
	BusinessProcess.prototype.registrations.map.test.defineProperties({
		isRequested: { value: false },
		requirements: { value: function () { return [this.master.requirements.map.req]; } }
	});
	defineMapCertificates(BusinessProcess, [TestDocument]);

	BusinessProcess.prototype.getOwnDescriptor('determinants').type = FormSection1;

	businessProcess = new BusinessProcess();
	a(businessProcess.guideProgress, 0.33);
	businessProcess.foo = true;
	a(businessProcess.guideProgress, 0.66);
	businessProcess.registrations.map.test.isRequested = true;
	a(businessProcess.guideProgress, 0.66);
	businessProcess.requirements.map.req.guideProgress = 1;
	a(businessProcess.guideProgress, 1);
};
