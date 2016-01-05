// BusinessProcess submission forms (step 3 of Part A) resolution

'use strict';

var memoize                     = require('memoizee/plain')
  , definePropertyGroupsProcess = require('../lib/property-groups-process')
  , defineBusinessProcess       = require('./base');

module.exports = memoize(function (db/* options */) {
	var BusinessProcess       = defineBusinessProcess(db, arguments[1])
	  , PropertyGroupsProcess = definePropertyGroupsProcess(db);

	BusinessProcess.prototype.defineProperties({
		submissionForms: { type: PropertyGroupsProcess, nested: true }
	});

	BusinessProcess.prototype.submissionForms.defineProperties({
		// Required confirmation from user, presented as last step before file submission
		isAffidavitSigned: { type: db.Boolean, required: true },
		formsProgress: { value: function (_observe) {
			var superGetter;
			superGetter = this.database.PropertyGroupsProcess.prototype.getDescriptor('progress')._value_;
			superGetter = this.database.resolveGetterObservables(superGetter);
			return superGetter.call(this, _observe);
		} },
		progress: { value: function (_observe) {
			var total = this.weight, valid = this.formsProgress * (total - 1);
			if (this.isAffidavitSigned && !_observe(this.master._isSentBack)) ++valid;
			return valid / total;
		} },
		weight: { value: function (_observe) {
			var superGetter;
			superGetter = this.database.PropertyGroupsProcess.prototype.getDescriptor('weight')._value_;
			superGetter = this.database.resolveGetterObservables(superGetter);
			return superGetter.call(this, _observe) + 1;
		} }
	});

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
