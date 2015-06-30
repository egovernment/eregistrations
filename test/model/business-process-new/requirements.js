'use strict';

var aFrom                 = require('es5-ext/array/from')
  , Database              = require('dbjs')
  , defineMapCertificates
	= require('../../../model/business-process-new/utils/define-certificates');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = t(db)

	  , businessProcess;

	var TestDocument = db.Document.extend('Test', {}, {
		label: { value: "Test document" }
	});

	BusinessProcess.prototype.defineProperties({ foo: { required: true } });

	BusinessProcess.prototype.requirements.map.defineProperties({
		req: { nested: true },
		test: { nested: true }
	});
	BusinessProcess.prototype.requirements.map.req.defineProperties({
		Document: { value: TestDocument },
		isApplicable: { value: false },
		guideProgress: { value: 0 }
	});

	BusinessProcess.prototype.requirements.map.test.defineProperties({
		Document: { value: TestDocument }
	});

	BusinessProcess.prototype.registrations.map.define('test', { nested: true });
	BusinessProcess.prototype.registrations.map.test.defineProperties({
		isRequested: { value: false },
		requirements: { value: function () { return [this.master.requirements.map.req]; } }
	});
	defineMapCertificates(BusinessProcess, [TestDocument]);

	businessProcess = new BusinessProcess();
	a.deep(aFrom(businessProcess.requirements.resolved), []);
	a.deep(aFrom(businessProcess.requirements.applicable), []);
	a(businessProcess.requirements.guideProgress, 1);

	businessProcess.registrations.map.test.isRequested = true;
	a.deep(aFrom(businessProcess.requirements.resolved), [businessProcess.requirements.map.req]);
	a.deep(aFrom(businessProcess.requirements.applicable), []);
	a(businessProcess.requirements.guideProgress, 1);

	businessProcess.requirements.map.req.isApplicable = true;
	a.deep(aFrom(businessProcess.requirements.resolved), [businessProcess.requirements.map.req]);
	a.deep(aFrom(businessProcess.requirements.applicable), [businessProcess.requirements.map.req]);
	a(businessProcess.requirements.guideProgress, 0);

	businessProcess.requirements.map.req.guideProgress = 1;
	a.deep(aFrom(businessProcess.requirements.resolved), [businessProcess.requirements.map.req]);
	a.deep(aFrom(businessProcess.requirements.applicable), [businessProcess.requirements.map.req]);
	a(businessProcess.requirements.guideProgress, 1);
};
