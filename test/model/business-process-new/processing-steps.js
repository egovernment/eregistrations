'use strict';

var aFrom    = require('es5-ext/array/from')
  , Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = t(db)

	  , businessProcess;

	BusinessProcess.prototype.processingSteps.map.define('test', { nested: true });
	BusinessProcess.prototype.processingSteps.map.define('test2', { nested: true });
	BusinessProcess.prototype.processingSteps.map.test2.define('isApplicable', { value: false });

	businessProcess = new BusinessProcess();
	a.deep(aFrom(businessProcess.processingSteps.applicable),
		[businessProcess.processingSteps.map.test]);
	businessProcess.processingSteps.map.test2.isApplicable = true;
	a.deep(aFrom(businessProcess.processingSteps.applicable),
		[businessProcess.processingSteps.map.test, businessProcess.processingSteps.map.test2]);

	a.deep(aFrom(businessProcess.processingSteps.revisions), []);
	BusinessProcess.prototype.processingSteps.map.define('revision', { nested: true });
	a.deep(aFrom(businessProcess.processingSteps.revisions), [
		businessProcess.processingSteps.map.revision]);
	BusinessProcess.prototype.processingSteps.map.revision.define('isApplicable', { value: false });
	a.deep(aFrom(businessProcess.processingSteps.revisions), []);
};
