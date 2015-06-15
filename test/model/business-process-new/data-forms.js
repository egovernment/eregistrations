'use strict';

var aFrom             = require('es5-ext/array/from')
  , Database          = require('dbjs')
  , defineFormSection = require('../../../model/form-section');

module.exports = function (t, a) {
	var db = new Database()
	  , FormSection = defineFormSection(db)
	  , BusinessProcess = t(db)
	  , businessProcess;

	BusinessProcess.prototype.dataForms.map.defineProperties({
		test1: { nested: true, type: FormSection },
		test2: { nested: true, type: FormSection }
	});
	businessProcess = new BusinessProcess();
	a.deep(aFrom(businessProcess.dataForms.applicable),
		[businessProcess.dataForms.map.test1, businessProcess.dataForms.map.test2]);
};
