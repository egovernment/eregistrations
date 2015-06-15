'use strict';

var aFrom    = require('es5-ext/array/from')
  , Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = t(db)

	  , businessProcess, reg1, reg2, reg3, reg4;

	BusinessProcess.prototype.registrations.map.defineProperties({
		reg1: { nested: true },
		reg2: { nested: true },
		reg3: { nested: true },
		reg4: { nested: true }
	});
	BusinessProcess.prototype.registrations.map.reg2.isApplicable = false;
	BusinessProcess.prototype.registrations.map.reg3.isMandatory = false;

	BusinessProcess.prototype.registrations.map.reg1.isRequested = false;
	BusinessProcess.prototype.registrations.map.reg2.isRequested = false;
	BusinessProcess.prototype.registrations.map.reg3.isRequested = false;
	BusinessProcess.prototype.registrations.map.reg4.isRequested = false;

	businessProcess = new BusinessProcess();
	reg1 = businessProcess.registrations.map.reg1;
	reg2 = businessProcess.registrations.map.reg2;
	reg3 = businessProcess.registrations.map.reg3;
	reg4 = businessProcess.registrations.map.reg4;
	a.deep(aFrom(businessProcess.registrations.applicable), [reg1, reg3, reg4]);
	a.deep(aFrom(businessProcess.registrations.mandatory), [reg1, reg4]);
	a.deep(aFrom(businessProcess.registrations.optional), [reg3]);
	a.deep(aFrom(businessProcess.registrations.requested), []);
	a(businessProcess.registrations.guideProgress, 0);
	reg2.isRequested = true;
	a.deep(aFrom(businessProcess.registrations.applicable), [reg1, reg3, reg4]);
	a.deep(aFrom(businessProcess.registrations.mandatory), [reg1, reg4]);
	a.deep(aFrom(businessProcess.registrations.optional), [reg3]);
	a.deep(aFrom(businessProcess.registrations.requested), []);
	a(businessProcess.registrations.guideProgress, 0);
	reg2.isApplicable = true;
	a.deep(aFrom(businessProcess.registrations.applicable), [reg1, reg2, reg3, reg4]);
	a.deep(aFrom(businessProcess.registrations.mandatory), [reg1, reg2, reg4]);
	a.deep(aFrom(businessProcess.registrations.optional), [reg3]);
	a.deep(aFrom(businessProcess.registrations.requested), [reg2]);
	a(businessProcess.registrations.guideProgress, 1);
	reg3.isMandatory = true;
	a.deep(aFrom(businessProcess.registrations.applicable), [reg1, reg2, reg3, reg4]);
	a.deep(aFrom(businessProcess.registrations.mandatory), [reg1, reg2, reg3, reg4]);
	a.deep(aFrom(businessProcess.registrations.optional), []);
	a.deep(aFrom(businessProcess.registrations.requested), [reg2]);
	a(businessProcess.registrations.guideProgress, 1);
};
