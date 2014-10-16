'use strict';

var db           = require('mano').db
  , StringLine = require('dbjs-ext/string/string-line')(db)
  , User         = require('mano-auth/model/user')(db)
  , Registration = require('./registration');

User.prototype.defineProperties({
	certificates: {
		type: db.Object,
		nested: true
	},
	registrations: {
		type: Registration,
		nested: true
	},
	mandatoryRegistrations: {
		type: StringLine,
		multiple: true,
		value: function () {
			var regs = [];
			this.database.Registration.extensions.forEach(function (reg) {
				var registrationPropName = reg.__id__[0].toLowerCase() + reg.__id__.slice(1);
				if (this.registrations[registrationPropName].isMandatory) {
					regs.push(registrationPropName);
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
			this.database.Registration.extensions.forEach(function (reg) {
				var registrationPropName = reg.__id__[0].toLowerCase() + reg.__id__.slice(1);
				if (!this.registrations[registrationPropName].isMandatory
						&& this.registrations[registrationPropName].isApplicable) {
					regs.push(registrationPropName);
				}
			}, this);
			return regs;
		}
	},
	requestedRegistrations: {
		type: StringLine,
		multiple: true,
		value: function (_observe) {
			var regs = [];
			this.database.Registration.extensions.forEach(function (reg) {
				var registrationPropName = reg.__id__[0].toLowerCase() + reg.__id__.slice(1);
				if (this.registrations[registrationPropName].isRequested) {
					regs.push(registrationPropName);
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
					if (reqs.indexOf(req) === -1) reqs.push(req);
				}, this);
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
					if (costs.indexOf(cost) === -1) costs.push(cost);
				}, this);
			}, this);
			return costs;
		}
	}
});


module.exports = User;
