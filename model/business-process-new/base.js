// Base BusinessProcess model

'use strict';

var memoize                   = require('memoizee/plain')
  , defineStringLine          = require('dbjs-ext/string/string-line')
  , _                         = require('mano').i18n.bind("Model: Business Process")
  , defineBusinessProcessBase = require('../lib/business-process-base')
  , defineNestedMap           = require('../lib/nested-map')
  , defineStatusLog           = require('../lib/status-log');

module.exports = memoize(function (db/*, options*/) {
	var StringLine = defineStringLine(db)
	  , StatusLog = defineStatusLog(db)
	  , BusinessProcessBase = defineBusinessProcessBase(db)
	  , BusinessProcess

	  , options = Object(arguments[1]);
	defineNestedMap(db);

	BusinessProcess = BusinessProcessBase.extend(options.className || 'BusinessProcess', {
		// Name of businessProcess
		// Usually computed from other properties
		businessName: { type: StringLine },

		// Whether initial configuration for businessProcess was set
		// Used to differentiate freshly created processes from those already "touched"
		isInitialized: { type: db.Boolean, value: true },

		// Whether registration is made online
		// It may be overriden to false in case we import businessProces
		// which not processed electronically.
		// It has its use in "business update" applications where we allow updates
		// of old registrations done at the counter
		isFromEregistrations: { type: db.Boolean, value: true,
			label: _("Has registration been made online?") }
	});

	BusinessProcess.prototype.defineNestedMap('statusLog',
		{ itemType: StatusLog, cardinalPropertyKey: 'label' });

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
