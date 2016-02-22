// Relations between business processes
// Derived business process is an update to already closed business process

'use strict';

var memoize               = require('memoizee/plain')
  , defineBusinessProcess = require('./flow');

module.exports = memoize(function (db/*, options*/) {
	var BusinessProcess = defineBusinessProcess(db, arguments[1]);

	BusinessProcess.prototype.defineProperties({
		// Chain of all derived business process
		// In other words, set of consecutive business process updates
		derivedBusinessProcesses: { type: BusinessProcess, multiple: true, value: function (_observe) {
			var processes = [], derived = this.derivedBusinessProcess;
			while (derived) {
				processes.push(derived);
				derived = _observe(derived._derivedBusinessProcess);
			}
			return processes;
		} },
		// Latest business process, so last business process update or initial business process
		// if there were no updates
		latestBusinessProcess: { type: BusinessProcess, value: function () {
			return this.derivedBusinessProcesses.last || this;
		} },
		// Whether given businessProcess can be derived
		// (it's the case when it's closed and not rejected, and there's no derived business process
		// update initialized yet
		canBeDerived: { type: db.Boolean, value: function (_observe) {
			if (this.derivedBusinessProcess) return false;
			if (!this.isClosed) return false;
			if (this.isRejected) return false;
			// Means this update is about closure of business process
			if (_observe(this.registrations.requested._has('closure'))) return false;
			return true;
		} },
		// Wether latest businessProcess in chain can be derived
		canLatestBeDerived: { type: db.Boolean, value: function (_observe) {
			return _observe(this.latestBusinessProcess._canBeDerived);
		} },
		// Business process update (or closure) to given business process
		derivedBusinessProcess: { type: BusinessProcess, unique: true,
			reverse: 'previousBusinessProcess' }
	});

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
