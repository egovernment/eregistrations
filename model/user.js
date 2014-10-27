'use strict';

var db           = require('mano').db
  , StringLine   = require('dbjs-ext/string/string-line')(db)
  , User         = require('mano-auth/model/user')(db)
  , Registration = require('./registration');

db.Object.define('createFormApplicableName', { type: db.Function, value: function (prop) {
	return 'is' + prop[0].toUpperCase() + prop.slice(1) + 'Applicable';
} });

db.Object.define('createFormResolvedApplicableName', { type: db.Function, value: function (prop) {
	return 'is' + prop[0].toUpperCase() + prop.slice(1) + 'ResolvedApplicable';
} });

User.prototype.defineProperties({
	certificates: {
		type: db.Object,
		nested: true
	},
	registrations: {
		type: db.Object,
		nested: true
	},
	applicableRegistrations: {
		type: StringLine,
		multiple: true,
		value: function () {
			var regs = [];
			this.registrations.forEach(function (reg) {
				if (reg.isApplicable) {
					regs.push(reg.key);
				}
			}, this);
			return regs;
		}
	},
	mandatoryRegistrations: {
		type: StringLine,
		multiple: true,
		value: function () {
			var regs = [];
			this.applicableRegistrations.forEach(function (regName) {
				var registration = this.registrations[regName];
				if (registration.isMandatory) {
					regs.push(regName);
				}
			}, this);
			return regs;
		}
	},

	optionalRegistrations: {
		type: StringLine,
		multiple: true,
		value: function () {
			var regs = [];
			this.applicableRegistrations.forEach(function (regName) {
				var registration = this.registrations[regName];
				if (!registration.isMandatory) {
					regs.push(regName);
				}
			}, this);
			return regs;
		}
	},
	requestedRegistrations: {
		type: StringLine,
		multiple: true,
		value: function () {
			var regs = [];
			this.applicableRegistrations.forEach(function (regName) {
				var registration = this.registrations[regName];
				if (registration.isRequested) {
					regs.push(regName);
				}
			}, this);
			return regs;
		}
	},
	requirements: {
		type: StringLine,
		multiple: true,
		value: function () {
			var reqs = [];
			this.requestedRegistrations.forEach(function (regName) {
				var userRegistration =  this.registrations[regName];
				userRegistration.requirements.forEach(function (req) {
					reqs.push(req);
				});
			}, this);
			return reqs;
		}
	},
	costs: {
		type: StringLine,
		multiple: true,
		value: function () {
			var costs = [];
			this.requestedRegistrations.forEach(function (regName) {
				var userRegistration =  this.registrations[regName];
				userRegistration.costs.forEach(function (cost) {
					costs.push(cost);
				});
			}, this);
			return costs;
		}
	}
});

User.prototype.registrations._descriptorPrototype_.setProperties({
	nested: true,
	type: Registration
});

module.exports = User;
