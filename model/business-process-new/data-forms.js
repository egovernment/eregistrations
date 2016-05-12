// BusinessProcess data forms (step 1 of Part A) resolution

'use strict';

var _                           = require('mano').i18n.bind('Model')
  , memoize                     = require('memoizee/plain')
  , Map                         = require('es6-map')
  , defineStringLine            = require('dbjs-ext/string/string-line')
  , defineCreateEnum            = require('dbjs-ext/create-enum')
  , definePropertyGroupsProcess = require('../lib/property-groups-process')
  , defineDataSnapshot          = require('../lib/data-snapshot')
  , defineBusinessProcess       = require('./base')
  , defineFormSectionBase       = require('../form-section-base');

module.exports = memoize(function (db/* options */) {
	var BusinessProcess       = defineBusinessProcess(db, arguments[1])
	  , PropertyGroupsProcess = definePropertyGroupsProcess(db)
	  , StringLine            = defineStringLine(db)
	  , FormSectionBase       = defineFormSectionBase(db)
	  , DataSnapshot          = defineDataSnapshot(db);

	defineCreateEnum(db);

	// Enum for forms status
	var DataFormsStatus = StringLine.createEnum('DataFormsStatus', new Map([
		['approved', { label: _("Valid") }],
		['rejected', { label: _("Invalid") }]
	]));

	BusinessProcess.prototype.defineProperties({
		dataForms: { type: PropertyGroupsProcess, nested: true }
	});

	BusinessProcess.prototype.dataForms.defineProperties({
		// Forms data snapshot (saved when file is submitted to Part B)
		dataSnapshot: { type: DataSnapshot, nested: true },

		// Applicable, touched (at least partially filled) form sections
		processChainApplicable: {
			type: FormSectionBase,
			multiple: true,
			value: function (_observe) {
				var sections = [];

				this.applicable.forEach(function (section) {
					if (_observe(section._status) === 0) return;
					sections.push(section);
				});

				return sections;
			}
		},
		incompleteOnlinePaymentsDependents: {
			type: FormSectionBase,
			multiple: true,
			value: function (_observe) {
				var result = [];
				this.applicable.forEach(function (section) {
					if (_observe(section._isOnlinePaymentDependent) &&
							_observe(section._status) < 1) {
						result.push(section);
					}
				});

				return result;
			}
		},
		// Verification status of data forms
		status: { type: DataFormsStatus },
		// Eventual rejection details
		rejectReason: { type: db.String, required: true, label: _("Explanation") },
		// Whether data forms was validated and all required properties where provided.
		isApproved: { type: db.Boolean, value: function (_observe) {
			return this.status === 'valid';
		} },
		// Whether data forms was rejected and reject reason was provided
		isRejected: { type: db.Boolean, value: function () {
			if (this.status == null) return false;
			if (this.status !== 'rejected') return false;
			return Boolean(this.rejectReason);
		} }
	});

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
