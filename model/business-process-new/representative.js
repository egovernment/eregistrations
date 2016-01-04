// Representative is the person who fills the form.

'use strict';

var memoize               = require('memoizee/plain')
  , defineBusinessProcess = require('./base')
  , definePerson          = require('../person');

module.exports = memoize(function (db/*, options*/) {
	var options         = Object(arguments[1])
	  , BusinessProcess = defineBusinessProcess(db, options)
	  , Person          = definePerson(db, options);

	BusinessProcess.prototype.define('representative', {
		type: Person,
		nested: true
	});

	BusinessProcess.prototype.representative.setProperties({
		email: function () {
			if (!this.master.user) {
				return;
			}
			return this.master.user.email;
		},
		firstName: function (_observe) {
			if (!this.master.user) {
				return;
			}
			return _observe(this.master.user._firstName);
		},
		lastName: function (_observe) {
			if (!this.master.user) {
				return;
			}
			return _observe(this.master.user._lastName);
		}
	});

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
