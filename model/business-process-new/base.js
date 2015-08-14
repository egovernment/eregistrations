// Base BusinessProcess model

'use strict';

var memoize                   = require('memoizee/plain')
  , defineStringLine          = require('dbjs-ext/string/string-line')
  , defineUrl                 = require('dbjs-ext/string/string-line/url')
  , _                         = require('mano').i18n.bind("Model: Business Process")
  , defineBusinessProcessBase = require('../lib/business-process-base')
  , defineNestedMap           = require('../lib/nested-map')
  , defineStatusLog           = require('../lib/status-log');

module.exports = memoize(function (db/*, options*/) {
	var StringLine = defineStringLine(db)
	  , Url = defineUrl(db)
	  , StatusLog = defineStatusLog(db)
	  , BusinessProcessBase = defineBusinessProcessBase(db)
	  , BusinessProcess

	  , options = Object(arguments[1]);
	defineNestedMap(db);

	BusinessProcess = BusinessProcessBase.extend(options.className || 'BusinessProcess', {
		// General label of business process type
		// It's not specific per business process, but should provide general info as:
		// "Merchant registration", "Company registration" etc.
		label: { type: StringLine },

		// Name of businessProcess
		// Usually computed from other properties
		businessName: { type: StringLine },

		// URL at which archive of files related to given business process
		// is accessible
		filesArchiveUrl: { type: Url },

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
