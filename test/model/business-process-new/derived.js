'use strict';

var aFrom    = require('es5-ext/array/from')
  , Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = t(db)

	  , businessProcess = new BusinessProcess(), businessProcessUpdate, businessProcessUpdate2;

	a.deep(aFrom(businessProcess.derivedBusinessProcesses), []);
	a(businessProcess.latestBusinessProcess, businessProcess);
	a(businessProcess.canBeDerived, false);
	a(businessProcess.canLatestBeDerived, false);
	a(businessProcess.derivedBusinessProcess, undefined);

	businessProcess.isClosed = true;
	a.deep(aFrom(businessProcess.derivedBusinessProcesses), []);
	a(businessProcess.latestBusinessProcess, businessProcess);
	a(businessProcess.canBeDerived, true);
	a(businessProcess.canLatestBeDerived, true);
	a(businessProcess.derivedBusinessProcess, undefined);

	businessProcessUpdate = new BusinessProcess();
	businessProcess.derivedBusinessProcess = businessProcessUpdate;
	a.deep(aFrom(businessProcess.derivedBusinessProcesses), [businessProcessUpdate]);
	a(businessProcess.latestBusinessProcess, businessProcessUpdate);
	a(businessProcess.canBeDerived, false);
	a(businessProcess.canLatestBeDerived, false);
	a.deep(aFrom(businessProcessUpdate.derivedBusinessProcesses), []);
	a(businessProcessUpdate.latestBusinessProcess, businessProcessUpdate);
	a(businessProcessUpdate.canBeDerived, false);
	a(businessProcessUpdate.canLatestBeDerived, false);
	a(businessProcessUpdate.derivedBusinessProcess, undefined);

	businessProcessUpdate.isClosed = true;
	a.deep(aFrom(businessProcess.derivedBusinessProcesses), [businessProcessUpdate]);
	a(businessProcess.latestBusinessProcess, businessProcessUpdate);
	a(businessProcess.canBeDerived, false);
	a(businessProcess.canLatestBeDerived, true);
	a.deep(aFrom(businessProcessUpdate.derivedBusinessProcesses), []);
	a(businessProcessUpdate.latestBusinessProcess, businessProcessUpdate);
	a(businessProcessUpdate.canBeDerived, true);
	a(businessProcessUpdate.canLatestBeDerived, true);
	a(businessProcessUpdate.derivedBusinessProcess, undefined);

	businessProcessUpdate2 = new BusinessProcess();
	businessProcessUpdate.derivedBusinessProcess = businessProcessUpdate2;
	a.deep(aFrom(businessProcess.derivedBusinessProcesses),
		[businessProcessUpdate, businessProcessUpdate2]);
	a(businessProcess.latestBusinessProcess, businessProcessUpdate2);
	a(businessProcess.canBeDerived, false);
	a(businessProcess.canLatestBeDerived, false);
	a.deep(aFrom(businessProcessUpdate.derivedBusinessProcesses), [businessProcessUpdate2]);
	a(businessProcessUpdate.latestBusinessProcess, businessProcessUpdate2);
	a(businessProcessUpdate.canBeDerived, false);
	a(businessProcessUpdate.canLatestBeDerived, false);

	businessProcessUpdate2.isClosed = true;
	a.deep(aFrom(businessProcess.derivedBusinessProcesses),
		[businessProcessUpdate, businessProcessUpdate2]);
	a(businessProcess.latestBusinessProcess, businessProcessUpdate2);
	a(businessProcess.canBeDerived, false);
	a(businessProcess.canLatestBeDerived, true);
	a.deep(aFrom(businessProcessUpdate.derivedBusinessProcesses), [businessProcessUpdate2]);
	a(businessProcessUpdate.latestBusinessProcess, businessProcessUpdate2);
	a(businessProcessUpdate.canBeDerived, false);
	a(businessProcessUpdate.canLatestBeDerived, true);
};
