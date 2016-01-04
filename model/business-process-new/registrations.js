// BusinessProcess registrations resolution

'use strict';

var memoize               = require('memoizee/plain')
  , definePercentage      = require('dbjs-ext/number/percentage')
  , defineRegistration    = require('../registration-new')
  , defineMultipleProcess = require('../lib/multiple-process')
  , defineBusinessProcess = require('./base');

module.exports = memoize(function (db/* options */) {
	var BusinessProcess = defineBusinessProcess(db, arguments[1])
	  , Percentage      = definePercentage(db)
	  , MultipleProcess = defineMultipleProcess(db)
	  , Registration    = defineRegistration(db);

	BusinessProcess.prototype.defineProperties({
		registrations: { type: MultipleProcess, nested: true }
	});

	BusinessProcess.prototype.registrations.map._descriptorPrototype_.type = Registration;
	BusinessProcess.prototype.registrations.defineProperties({
		// Applicable registrations (resolved out of registration.isApplicable on each registration)
		applicable: { type: Registration },

		// Mandatory subset of applicable registrations
		mandatory: { type: Registration, multiple: true, value: function (_observe) {
			var result = [];
			this.applicable.forEach(function (entity) {
				var isMandatory = entity._get ? _observe(entity._isMandatory) : entity.isMandatory;
				if (isMandatory) result.push(entity);
			});
			return result;
		} },
		// Optional subset of applicable registrations
		optional: { type: Registration, multiple: true, value: function (_observe) {
			var result = [];
			this.applicable.forEach(function (entity) {
				var isMandatory = entity._get ? _observe(entity._isMandatory) : entity.isMandatory;
				if (!isMandatory) result.push(entity);
			});
			return result;
		} },
		// Requested subset of applicable registrations
		requested: { type: Registration, multiple: true, value: function (_observe) {
			var result = [];
			this.applicable.forEach(function (entity) {
				var isRequested = entity._get ? _observe(entity._isRequested) : entity.isRequested;
				if (isRequested) result.push(entity);
			});
			return result;
		} },
		// Indicates whether some registrations were chosen by user
		// It's one of the sub calculations that are needed to calcualate guide progress
		guideProgress: { type: Percentage, value: function () { return this.requested.size ? 1 : 0; } },
		groups: { type: db.Object, nested: true }
	});

	BusinessProcess.prototype.registrations.groups._descriptorPrototype_.type = Registration;

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
