// FrontDesk processing step configuration

'use strict';

var memoize                 = require('memoizee/plain')
  , _                       = require('mano').i18n.bind('Model')
  , defineProcessingStep    = require('../processing-step')
  , defineInstitution       = require('../institution')
  , ensureDb                = require('dbjs/valid-dbjs')
  , ensureType              = require('dbjs/valid-dbjs-type');

module.exports = memoize(function (db/*, options */) {
	var options = Object(arguments[1])
	  , Institution, Parent, FrontDeskProcessingStep;

	ensureDb(db);

	Institution = defineInstitution(db);

	if (options.parent) {
		Parent = ensureType(options.parent);
	} else {
		Parent = defineProcessingStep(db);
	}

	FrontDeskProcessingStep = Parent.extend('FrontDeskProcessingStep', {
		label: { value: _("Front Desk") },
		isApplicable: {
			value: function (_observe) {
				return _observe(this.possibleInstitutions._size) > 0;
			}
		},
		chosenInstitution: {
			required: true,
			type: Institution,
			label: _("Select the location where you want to pick up your documents.")
		},
		possibleInstitutions: {
			type: Institution,
			multiple: true
		},
		institution: {
			type: Institution,
			value: function (_observe) {
				if (_observe(this.possibleInstitutions._size) === 1) {
					return this.possibleInstitutions.first;
				}
				return this.chosenInstitution;
			}
		},
		approvalProgress: {
			value: function (_observe) {
				var requirementUploads, certificates, requirementsProgress = 0, certificatesProgress = 0;

				if (this.steps && _observe(this.steps.applicable._size)) {
					requirementUploads = this.steps.applicable.first.requirementUploads;
				} else {
					requirementUploads = this.requirementUploads;
				}
				certificates = this.master.certificates;

				if (requirementUploads) {
					requirementsProgress = _observe(requirementUploads.frontDeskApplicable._size)
						=== _observe(requirementUploads.frontDeskApproved._size) ? 0.5 : 0;
				}
				certificatesProgress = _observe(certificates.toBeHanded).every(function (cert) {
					return _observe(cert._wasHanded);
				}) ? 0.5 : 0;

				return requirementsProgress + certificatesProgress;
			}
		}
	});

	return FrontDeskProcessingStep;
}, { normalizer: require('memoizee/normalizers/get-1')() });
