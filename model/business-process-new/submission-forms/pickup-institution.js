"use strict";

var memoize             = require('memoizee/plain')
  , defineFormSection   = require('../../form-section')
  , ensureDb            = require('dbjs/valid-dbjs')
  , defineFrontDeskStep = require('../../processing-steps/front-desk')
  , _                   = require('mano').i18n.bind('Business Process: Model: Submission forms');

module.exports = memoize(function (db) {
	var FormSection;
	ensureDb(db);
	FormSection = defineFormSection(db);
	return FormSection.extend('PickupInstitutionFormSection', {
		label: { value: _("Where do you want to collect your registrations?") },
		actionUrl: { value: 'pickup-institution' },
		propertyMasterType: { value:  defineFrontDeskStep(db) },
		propertyNames: { value: ['chosenInstitution'] },
		isApplicable: {
			value: function (_observe) {
				var processingSteps = this.master.processingSteps;
				return _observe(processingSteps.applicable).has(processingSteps.map.frontDesk);
			}
		},
		status: {
			value: function (_observe) {
				var total = 0, valid = 0, frontDesk;
				frontDesk = this.master.processingSteps.map.frontDesk;

				if (_observe(frontDesk.possibleInstitutions._size)) {
					++total;
					if (_observe(frontDesk._institution)) ++valid;

					return valid / total;
				}
				return 1;
			}
		}
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
