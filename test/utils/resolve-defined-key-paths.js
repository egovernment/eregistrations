'use strict';

var defineBusinessProcess = require('../../model/business-process-new')
  , Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = defineBusinessProcess(db)
	  , businessProcess = new BusinessProcess(), paths = [], paths2;

	paths = ['businessName', 'abbr', 'label', 'submissionNumber'];
	a.deep(t(businessProcess, paths), paths);
	paths2 = paths.slice(0);
	paths.push('non-existing-prop');
	a.deep(t(businessProcess, paths), paths2);
};
