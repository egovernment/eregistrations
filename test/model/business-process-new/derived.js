'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = t(db)

	  , businessProcess = new BusinessProcess(), derivedBusinessProcess = new BusinessProcess();

	a(businessProcess.canBeDerivationSource, false);
	a(derivedBusinessProcess.derivedFrom, undefined);

	businessProcess.isApproved = true;
	a(businessProcess.canBeDerivationSource, true);
	a.throws(function () { businessProcess.derive(null); },
		new RegExp('null cannot be derived, instance of BusinessProcess is expected'),
		'throws when bad businessProcess param');
	a(businessProcess.derive(derivedBusinessProcess), true);
	a(derivedBusinessProcess.derivedFrom, businessProcess);
};
