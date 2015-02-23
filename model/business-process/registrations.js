'use strict';

var memoize            = require('memoizee/plain')
  , validDbType        = require('dbjs/valid-dbjs-type')
  , definePercentage   = require('dbjs-ext/number/percentage')
  , defineStringLine   = require('dbjs-ext/string/string-line')
  , defineRegistration = require('../registration')
  , defineSubmission   = require('../submission')
  , endsWith           = require('es5-ext/string/#/ends-with');

module.exports = memoize(function (Target/* options */) {
	var db, StringLine, Percentage, Submission, options;
	validDbType(Target);
	db = Target.database;
	options = Object(arguments[1]);
	defineRegistration(db);
	Percentage = definePercentage(db);
	StringLine = defineStringLine(db);
	Submission = options.submissionClass || defineSubmission(db);

	Target.prototype.defineProperties({
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
		},
		resolvedRequirements: {
			type: StringLine,
			multiple: true,
			value: function (_observe) {
				var certs = this.requestedCertificates, result = [];
				this.requestedRegistrations.forEach(function (regName) {
					_observe(this.registrations[regName].requirements).forEach(function (req) {
						if (certs.has(req)) return;
						result.push(req);
					}, this);
				}, this);
				return result;
			}
		},
		applicableRequirements: {
			type: StringLine,
			multiple: true,
			value: function (_observe) {
				var result = [];
				this.resolvedRequirements.forEach(function (requirement) {
					if (_observe(this.requirements[requirement].isApplicable)) result.push(requirement);
				}, this);
				return result;
			}
		},
		applicableSubmissions: {
			type: Submission,
			multiple: true,
			value: function (_observe) {
				var result = [];
				this.applicableRequirements.forEach(function (req) {
					_observe(this.requirements[req].submissions).forEach(function (sub) {
						result.push(sub);
					});
				}, this);
				return result;
			}
		},
		questionsStatus: {
			type: Percentage,
			value: 1
		},
		submissionsStatus: {
			type: Percentage,
			value: function (_observe) {
				var total, valid, submission;
				total = valid = 0;
				if (this.questionsStatus !== 1) return 0;
				if (!this.applicableSubmissions.size) return 1;
				this.applicableSubmissions.forEach(function (subName) {
					++total;
					submission = this.submissions[subName];
					if (!_observe(submission.orderedFiles._size)) return;
					if (submission.orderedFiles.some(function (file) { return _observe(file._path); })) {
						++valid;
					}
				}, this);
				return valid / total;
			}
		}
	});

	if (options.classes) {
		options.classes.forEach(function (registration) {
			if (!endsWith.call(registration.__id__, "Registration")) {
				throw new Error("Class: " + registration.__id__ + " doesn't end with 'Registration'." +
					" All registration class names must end with 'Registration'.");
			}
			Target.prototype.registrations.define(registration.__id__[0].toLowerCase() +
				registration.__id__.slice(1, -("Registration".length)), {
					type: registration,
					nested: true
				});
		});
	}

	return Target;
}, { normalizer: require('memoizee/normalizers/get-1')() });
