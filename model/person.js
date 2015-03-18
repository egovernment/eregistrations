"use strict";

var _                   = require('mano').i18n.bind("Model: Person")
  , memoize             = require('memoizee/plain')
  , validDb             = require('dbjs/valid-dbjs')
  , defineStringLine    = require('dbjs-ext/string/string-line');

module.exports = memoize(function (db/*, options*/) {
	var StringLine;
	validDb(db);
	StringLine = defineStringLine(db);

	return db.Object.extend('Person', {
		firstName: { type: StringLine, label: _("First Name"), required: true },
		lastName: { type: StringLine, label: _("Last name"), required: true },
		fullName: { type: db.StringLine, label: _("Name"), value: function () {
			return (this.firstName || "") + " " + (this.lastName || "");
		} }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
