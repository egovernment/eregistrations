'use strict';

var memoize            = require('memoizee/plain')
  , validDb            = require('dbjs/valid-dbjs')
  , defineUser         = require('mano-auth/model/user')
  , defineStringLine   = require('dbjs-ext/string/string-line')
  , defineRegistration = require('./../registration');

module.exports = memoize(function (db) {
	var User, StringLine;
	defineRegistration(validDb(db));
	User         = defineUser(db);
	StringLine   = defineStringLine(db);

	User.prototype.defineProperties({
		registrations: {
			type: db.Object,
			nested: true
		},
		applicableRegistrations: {
			type: StringLine,
			multiple: true,
			value: function (_observe) {
				var regs = [];
				this.registrations.forEach(function (reg) {
					var isApplicable = reg._get ? _observe(reg._isApplicable) : reg.isApplicable;
					if (isApplicable) regs.push(reg.key);
				}, this);
				return regs;
			}
		},
		mandatoryRegistrations: {
			type: StringLine,
			multiple: true,
			value: function (_observe) {
				var regs = [];
				this.applicableRegistrations.forEach(function (regName) {
					var registration = this.registrations[regName];
					var isMandatory = registration._get
						? _observe(registration._isMandatory) : registration.isMandatory;
					if (isMandatory) regs.push(regName);
				}, this);
				return regs;
			}
		},

		optionalRegistrations: {
			type: StringLine,
			multiple: true,
			value: function (_observe) {
				var regs = [];
				this.applicableRegistrations.forEach(function (regName) {
					var registration = this.registrations[regName];
					var isMandatory = registration._get
						? _observe(registration._isMandatory) : registration.isMandatory;
					if (!isMandatory) regs.push(regName);
				}, this);
				return regs;
			}
		},
		requestedRegistrations: {
			type: StringLine,
			multiple: true,
			value: function (_observe) {
				var regs = [];
				this.applicableRegistrations.forEach(function (regName) {
					var registration = this.registrations[regName];
					var isRequested = registration._get
						? _observe(registration._isRequested) : registration.isRequested;
					if (isRequested) regs.push(regName);
				}, this);
				return regs;
			}
		},
		requestedCertificates: {
			type: StringLine,
			multiple: true,
			value: function (_observe) {
				var certs = [];
				this.requestedRegistrations.forEach(function (regName) {
					_observe(this.registrations[regName].certificates).forEach(function (cert) {
						certs.push(cert);
					});
				}, this);
				return certs;
			}
		}
	});

	return db.User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
