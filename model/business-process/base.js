'use strict';

var _                = require('mano').i18n.bind("Model: Business Process")
  , memoize          = require('memoizee/plain')
  , validDb          = require('dbjs/valid-dbjs')
  , defineStatusLog  = require('../lib/status-log')
  , defineStringLine = require('dbjs-ext/string/string-line')
  , defineNestedMap  = require('../lib/nested-map')
  , defineBusinessProcessStatus = require('../lib/business-process-status');

module.exports = memoize(function (db/*, options*/) {
	var StringLine, BusinessProcessStatus, StatusLog;
	validDb(db);
	BusinessProcessStatus = defineBusinessProcessStatus(db);
	StringLine            = defineStringLine(db);
	StatusLog             = defineStatusLog(db);
	defineNestedMap(db);

	db.Object.extend('BusinessProcess', {
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
			type: db.BusinessProcess,
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
			type: db.BusinessProcess,
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
			type: db.BusinessProcess,
			unique: true,
			reverse: 'previousBusinessProcess'
		}
	});

	db.BusinessProcess.prototype.defineNestedMap('statusLog',
		{ itemType: StatusLog, cardinalPropertyKey: 'label' });

	return db.BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
