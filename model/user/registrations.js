'use strict';

var memoize            = require('memoizee/plain')
  , validDb            = require('dbjs/valid-dbjs')
  , defineUser         = require('mano-auth/model/user')
  , defineStringLine   = require('dbjs-ext/string/string-line')
  , defineRegistration = require('./../registration');

module.exports = memoize(function (db) {
	var User, StringLine, Registration;
	validDb(db);
	User         = defineUser(db);
	StringLine   = defineStringLine(db);
	Registration = defineRegistration(db);
	User.prototype.defineProperties({
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
		}
	});

	User.prototype.registrations._descriptorPrototype_.setProperties({
		nested: true,
		type: Registration
	});

	return db.User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
