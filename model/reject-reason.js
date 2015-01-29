'use strict';

var memoize          = require('memoizee/plain')
  , validDb          = require('dbjs/valid-dbjs')
  , Map              = require('es6-map')
  , _                = require('mano').i18n.bind('Model: User')
  , defineStringLine = require('dbjs-ext/string/string-line');

module.exports = memoize(function (db) {
	var StringLine;
	validDb(db);
	StringLine = defineStringLine(db);
	require('dbjs-ext/create-enum')(db);

	return StringLine.createEnum('RejectReason', new Map([
		["illegible", {
			label: _("The document is unreadable")
		}],
		["invalid", {
			label: _("The loaded document does not match the required document")
		}],
		["other", {
			label: _("Other") + "..."
		}]
	]));
}, { normalizer: require('memoizee/normalizers/get-1')() });
