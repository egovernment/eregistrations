// Base BusinessProcess model

'use strict';

var memoize          = require('memoizee/plain')
  , defineStringLine = require('dbjs-ext/string/string-line')
  , _                = require('mano').i18n.bind("Model: Business Process")
  , defineStatusLog  = require('../lib/status-log');

module.exports = memoize(function (db/*, options*/) {
	var StringLine = defineStringLine(db)
	  , StatusLog = defineStatusLog(db)

	  , options = Object(arguments[1]);

	return db.Object.extend(options.className || 'BusinessProcess', {
		// Name of businessProcess
		// Usually computed from other properties
		businessName: { type: StringLine },

		// Whether registration is made online
		// It may be overriden to false in case we import businessProces
		// which not processed electronically.
		// It has its use in "business update" applications where we allow updates
		// of old registrations done at the counter
		isFromEregistrations: { type: db.Boolean, value: true,
			label: _("Has registration been made online?") },

		// Processing log
		statusLog: { type: StatusLog, multiple: true }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
