// Revision processing step configuration

'use strict';

var memoize                  = require('memoizee/plain')
  , _                        = require('mano').i18n.bind('Model')
  , defineProcessingStep     = require('../processing-step')
  , defineRequirementUploads = require('../business-process-new/requirement-uploads')
  , defineProcessingSteps    = require('../business-process-new/processing-steps')
  , defineInstitution        = require('../institution')
  , ensureDb                 = require('dbjs/valid-dbjs');

module.exports = memoize(function (db) {
	var Institution;
	ensureDb(db);

	Institution = defineInstitution(db);
	defineRequirementUploads(db);
	defineProcessingSteps(db);
	return defineProcessingStep(db).extend('FrontDeskProcessingStep', {
		label: { value: _("Front desk") },
		chosenInstitution: {
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
				if (!_observe(this.possibleInstitutions._size)) return null;
				if (this.possibleInstitutions.size === 1) {
					return this.possibleInstitutions.first;
				}
				return this.chosenInstitution;
			}
		}
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
