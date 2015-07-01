// Base BusinessProcess model

'use strict';

var memoize          = require('memoizee/plain')
  , defineStringLine = require('dbjs-ext/string/string-line')
  , _                = require('mano').i18n.bind("Model: Business Process")
  , defineStatusLog  = require('../lib/status-log')
  , defineNestedMap  = require('../lib/nested-map');

module.exports = memoize(function (db/*, options*/) {
	var StringLine = defineStringLine(db)
	  , StatusLog = defineStatusLog(db)
	  , BusinessProcess

	  , options = Object(arguments[1]);
	defineNestedMap(db);

	BusinessProcess = db.Object.extend(options.className || 'BusinessProcess', {
		// Name of businessProcess
		// Usually computed from other properties
		businessName: { type: StringLine },

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
