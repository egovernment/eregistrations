// Representative is the person who fills the form.

'use strict';

var memoize       = require('memoizee/plain')
  , _             = require('mano').i18n.bind("Model: Business Process")
  , defineInitial = require('./base')
  , defineEmail   = require('dbjs-ext/string/string-line/email')
  , definePerson  = require('../person');

module.exports = memoize(function (db/*, options*/) {
	var BusinessProcess, Person, Email, options, representative;
	options = Object(arguments[1]);
	BusinessProcess = defineInitial(db, options);
	Person  = definePerson(db, options);
	Email   = defineEmail(db, options);

	BusinessProcess.prototype.define('representative', {
		type: Person,
		nested: true
	});
	representative = BusinessProcess.prototype.representative;

	representative.define('email', {
		type: Email,
		label: _("Email"),
		value: function () {
			if (!this.master.user) {
				return;
			}
			return this.master.user.email;
		}
	});

	representative.firstName = function (_observe) {
		if (!this.master.user) {
			return;
		}
		return _observe(this.master.user._firstName);
	};
	representative.lastName = function (_observe) {
		if (!this.master.user) {
			return;
		}
		return _observe(this.master.user._lastName);
	};

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
