'use strict';

var memoize                     = require('memoizee/plain')
  , defineStringLine            = require('dbjs-ext/string/string-line')
  , _                           = require('mano').i18n.bind("Model: Business Process")
  , defineBusinessProcessBase   = require('../lib/business-process-base')
  , defineBusinessProcessStatus = require('../lib/business-process-status')
  , defineNestedMap             = require('../lib/nested-map')
  , defineStatusLog             = require('../lib/status-log');

module.exports = memoize(function (db/*, options*/) {
	var BusinessProcessStatus = defineBusinessProcessStatus(db)
	  , StringLine = defineStringLine(db)
	  , StatusLog = defineStatusLog(db)
	  , BusinessProcessBase = defineBusinessProcessBase(db);

	defineNestedMap(db);

	BusinessProcessBase.extend('BusinessProcess', {
		//Marks an obsolete model
		isOldModel: { type: db.Boolean, value: true },
		isFromEregistrations: { type: db.Boolean,
			value: true,
			label: _("Has registration been made online?")
			},
		isApplicationCompleted: {
			type: db.Boolean,
			value: false
		},
		status: { type: BusinessProcessStatus, value: function () {
			if (this.isApplicationResolved || this.isApplicationRejected) {
				return 'closed';
			}
			if (this.isRegistrationReady) {
				return 'pickup';
			}
			if (this.isApplicationCompleted) {
				return 'process';
			}

			return 'draft';
		} },
		submitted: { type: db.Boolean, value: false },
		businessName: { type: StringLine }
	});

	db.BusinessProcess.prototype.defineProperties({
		derivedBusinessProcesses: {
			type: BusinessProcessBase,
			multiple: true,
			value: function (_observe) {
				var processes = [], derived = this.derivedBusinessProcess;
				while (derived) {
					processes.push(derived);
					derived = _observe(derived._derivedBusinessProcess);
				}
				return processes;
			}
		},
		latestBusinessProcess: {
			type: BusinessProcessBase,
			value: function () {
				return this.derivedBusinessProcesses.last || this;
			}
		},
		canBeDerived: {
			type: db.Boolean,
			value: function (_observe) {
				if (this.derivedBusinessProcess) {
					return false;
				}
				if (!this.isApplicationResolved) return false;
				if (_observe(this.requestedRegistrations._has('closure'))) return false;

				return true;
			}
		},
		canLatestBeDerived: {
			type: db.Boolean,
			value: function (_observe) {
				return _observe(this.latestBusinessProcess._canBeDerived);
			}
		},
		derivedBusinessProcess: {
			type: BusinessProcessBase,
			unique: true,
			reverse: 'previousBusinessProcess'
		}
	});

	db.BusinessProcess.prototype.defineNestedMap('statusLog',
		{ itemType: StatusLog, cardinalPropertyKey: 'label' });

	return db.BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
