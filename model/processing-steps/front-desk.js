// Revision processing step configuration

'use strict';

var memoize                  = require('memoizee/plain')
  , _                        = require('mano').i18n.bind('Model')
  , defineProcessingStep     = require('../processing-step')
  , defineProcessingSteps    = require('../business-process-new/processing-steps')
  , defineInstitution        = require('../institution')
  , ensureDb                 = require('dbjs/valid-dbjs');

module.exports = memoize(function (db) {
	var Institution;
	ensureDb(db);

	Institution = defineInstitution(db);
	defineProcessingSteps(db);
	return defineProcessingStep(db).extend('FrontDeskProcessingStep', {
		label: { value: _("Front desk") },
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
		}
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
