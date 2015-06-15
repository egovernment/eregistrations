'use strict';

var aFrom    = require('es5-ext/array/from')
  , Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = t(db)
	  , businessProcess;

	BusinessProcess.prototype.registrations.map.define('test', { nested: true });
	BusinessProcess.prototype.costs.map.define('test1', { nested: true });
	BusinessProcess.prototype.costs.map.define('test2', { nested: true });
	BusinessProcess.prototype.registrations.map.test.costs = function () {
		return [this.master.costs.map.test1, this.master.costs.map.test2];
	};
	businessProcess = new BusinessProcess();
	a.deep(aFrom(businessProcess.costs.applicable),
		[businessProcess.costs.map.test1, businessProcess.costs.map.test2]);
	businessProcess.registrations.map.test.isRequested = false;
	a.deep(aFrom(businessProcess.costs.applicable), []);
};
