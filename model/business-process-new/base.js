// Base BusinessProcess model

'use strict';

var memoize                   = require('memoizee/plain')
  , defineStringLine          = require('dbjs-ext/string/string-line')
  , defineUInteger            = require('dbjs-ext/number/integer/u-integer')
  , defineUrl                 = require('dbjs-ext/string/string-line/url')
  , _                         = require('mano').i18n.bind("Model: Business Process")
  , defineBusinessProcessBase = require('../lib/business-process-base')
  , defineNestedMap           = require('../lib/nested-map')
  , defineStatusLog           = require('../lib/status-log');

module.exports = memoize(function (db/*, options*/) {
	var options             = Object(arguments[1])
	  , BusinessProcessBase = defineBusinessProcessBase(db)
	  , StringLine          = defineStringLine(db)
	  , UInteger            = defineUInteger(db)
	  , Url                 = defineUrl(db)
	  , StatusLog           = defineStatusLog(db)

	  , BusinessProcess;

	defineNestedMap(db);

	BusinessProcess = BusinessProcessBase.extend(options.className || 'BusinessProcess', {
		// General label of business process type
		// It's not specific per business process, but should provide general info as:
		// "Merchant registration", "Company registration" etc.
		label: { type: StringLine },

		// General abbreviation of business process type
		// e.g. IT (Individual trader), C (Company), COI (Certificate of incentives)
		abbr: { type: StringLine },

		// Name of businessProcess
		// Usually computed from other properties
		businessName: { type: StringLine },

		// URL at which archive of files related to given business process
		// is accessible
		filesArchiveUrl: { type: Url },

		submissionNumber: { type: db.Object, nested: true },

		// Whether registration is made online
		// It may be overriden to false in case we import businessProces
		// which not processed electronically.
		// It has its use in "business update" applications where we allow updates
		// of old registrations done at the counter
		isFromEregistrations: { type: db.Boolean, value: true,
			label: _("Has registration been made online?") },

		// String over which business processes can be searched
		// through interface panel (computed value is later indexed by persistence engine)
		searchString: { type: db.String, value: function () {
			var arr = [], submissionNumber = String(this.submissionNumber);
			if (this.businessName) arr.push(this.businessName.toLowerCase());
			if (submissionNumber) arr.push(submissionNumber.toLowerCase());
			return arr.join('\x02');
		} },

		// An array of email addresses used as notification recipients (to field).
		// Uses user and manager emails, if the exist, by default.
		notificationEmails: { type: StringLine, multiple: true, value: function (_observe) {
			var result = [];

			if (this.user) result.push(_observe(this.user._email));
			if (this.manager) result.push(_observe(this.manager._email));

			return result;
		} }
	});

	BusinessProcess.prototype.submissionNumber.defineProperties({
		value: { type: StringLine, value: function () { return this.number; } },
		number: { type: UInteger, value: 0 },
		toString: { value: function (opts) { return this.value; } }
	});

	BusinessProcess.prototype.defineNestedMap('statusLog',
		{ itemType: StatusLog, cardinalPropertyKey: 'label' });

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
