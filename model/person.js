"use strict";

var _                = require('mano').i18n.bind("Model: Person")
  , memoize          = require('memoizee/plain')
  , validDb          = require('dbjs/valid-dbjs')
  , defineEmail      = require('dbjs-ext/string/string-line/email')
  , defineStringLine = require('dbjs-ext/string/string-line');

module.exports = memoize(function (db/*, options*/) {
	var Email, StringLine;
	validDb(db);
	StringLine = defineStringLine(db);
	Email      = defineEmail(db);

	return db.Object.extend('Person', {
		toString: { value: function (options) {
			return this.fullName;
		} },
		email: { type: Email, label: _("Email"), required: true },
		firstName: { type: StringLine, label: _("First name"), required: true },
		lastName: { type: StringLine, label: _("Last name"), required: true },
		fullName: { type: db.StringLine, label: _("Full name"), value: function () {
			return (this.firstName || "") + " " + (this.lastName || "");
		} },
		phone: { type: StringLine, label: _("Phone number") }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
