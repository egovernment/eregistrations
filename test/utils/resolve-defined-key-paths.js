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
	paths.push({ pathFrom: 'businessName', pathTo: 'abbr' });
	paths2.push({ pathFrom: 'businessName', pathTo: 'abbr' });
	a.throws(function () { t(businessProcess, paths); },
		new RegExp('When using path objects, you must setup isSource flag'),
		'throws using path object and no isSource is specified');

	a.deep(t(businessProcess, paths, { isSource: true }), paths2);
	var nonExistingMapping = { pathFrom: 'submissionNumber', pathTo: 'non-existing-prop' };
	paths.push(nonExistingMapping);
	a.deep(t(businessProcess, paths, { isSource: false }), paths2);
	paths2.push(nonExistingMapping);
	// We get non existing mapping, cause we checked only the source
	a.deep(t(businessProcess, paths, { isSource: true }), paths2);
};
