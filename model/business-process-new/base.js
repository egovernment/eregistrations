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
	var StringLine = defineStringLine(db)
	  , Url = defineUrl(db)
	  , UInteger  = defineUInteger(db)
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
		// Below implementation just provides businessName, but it also shows
		// how many properties can be reliably grouped into one result string for search
		searchString: { type: db.String, value: function () {
			var arr = [];
			if (this.businessName) arr.push(this.businessName.toLowerCase());
			return arr.join('\x02');
		} }
	});

	BusinessProcess.prototype.submissionNumber.defineProperties({
		value: { type: StringLine, value: function () {
			return this.number;
		} },
		number: { type: UInteger, value: 0 },
		toString: { value: function (opts) {
			return this.value;
		} }
	});

	BusinessProcess.prototype.defineNestedMap('statusLog',
		{ itemType: StatusLog, cardinalPropertyKey: 'label' });

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
