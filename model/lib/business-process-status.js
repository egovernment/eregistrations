'use strict';

var memoize          = require('memoizee/plain')
  , validDb          = require('dbjs/valid-dbjs')
  , Map              = require('es6-map')
  , _                = require('mano').i18n.bind('Model: Business Process: Status')
  , defineStringLine = require('dbjs-ext/string/string-line');

module.exports = memoize(function (db) {
	var StringLine;
	validDb(db);
	StringLine = defineStringLine(db);
	require('dbjs-ext/create-enum')(db);

	return StringLine.createEnum('BusinessProcessStatus', new Map([
		["draft", {
			label: _("Draft")
		}],
		["revision", {
			label: _("Revision")
		}],
		["sentBack", {
			label: _("Pending for correction")
		}],
		["process", {
			label: _("In process")
		}],
		["pickup", {
			label: _("Processed and ready for pickup")
		}],
		["rejected", {
			label: _("Rejected")
		}],
		["withdrawalReady", {
			label: _("Ready for withdraw")
		}],
		["withdrawn", {
			label: _("Withdrawn")
		}],
		["closed", {
			label: _("Processed and closed")
		}]
	]));
}, { normalizer: require('memoizee/normalizers/get-1')() });
