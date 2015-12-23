// FrontDesk processing step configuration

'use strict';

var memoize               = require('memoizee/plain')
  , _                     = require('mano').i18n.bind('Model')
  , defineProcessingStep  = require('../processing-step')
  , defineProcessingSteps = require('../business-process-new/processing-steps')
  , defineInstitution     = require('../institution')
  , ensureDb              = require('dbjs/valid-dbjs')
  , ensureType            = require('dbjs/valid-dbjs-type');

module.exports = memoize(function (db/*, options */) {
	var Institution, Parent, options;
	ensureDb(db);
	options = Object(arguments[1]);

	Institution = defineInstitution(db);
	defineProcessingSteps(db);
	if (options.parent) {
		Parent = ensureType(options.parent);
	} else {
		Parent = defineProcessingStep(db);
	}
	return Parent.extend('FrontDeskProcessingStep', {
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
				var requirementUploads = this.requirementUploads;
				return _observe(requirementUploads.frontDeskApplicable._size)
					=== _observe(requirementUploads.frontDeskApproved._size) ? 1 : 0;
			}
		}
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
