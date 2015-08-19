"use strict";

var memoize               = require('memoizee/plain')
  , defineFormSection     = require('../../form-section')
  , ensureDb              = require('dbjs/valid-dbjs')
  , defineFrontDeskStep   = require('../../processing-steps/front-desk')
  , _                     = require('mano').i18n.bind('Business Process: Model: Submission forms');

module.exports = memoize(function (db) {
	var FormSection, FrontDeskStep;
	ensureDb(db);
	FormSection   = defineFormSection(db);
	FrontDeskStep = defineFrontDeskStep(db);
	FrontDeskStep.prototype.set('isChosenInstitutionFormApplicable', function (_observe) {
		return _observe(this.possibleInstitutions._size) > 1;
	});
	return FormSection.extend('PickupInstitutionFormSection', {
		label: { value: _("Where do you want to collect your registrations?") },
		actionUrl: { value: 'pickup-institution' },
		propertyNames: { value: ['processingSteps/map/frontDesk/chosenInstitution'] },
		isApplicable: {
			value: function (_observe) {
				return _observe(this.master.processingSteps.map.frontDesk._isApplicable);
			}
		}
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
