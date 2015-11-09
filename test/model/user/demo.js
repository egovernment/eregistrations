// TODO

'use strict';

var Database       = require('dbjs')
  , defineUInteger = require('dbjs-ext/number/integer/u-integer');

module.exports = function (t, a) {
	var db           = new Database()
	  , User         = t(db)
	  , TestUserType = User.extend('TestUserType')
	  , UInteger     = defineUInteger(db)

	  , user;

	// ------------------ Setup ------------------

	TestUserType.prototype.defineProperties({
		isDemo: {
			value: true
		},
		// Last access microtime for demo users.
		demoLastAccessed: {
			value: 42
		}
	});

	// ------------------ Tests ------------------

	a.h1('Default values');
	user = new User();

	a(user.isDemo, false);
	a(user.demoLastAccessed, 0);

	a.h1('Type extension');
	user = new TestUserType();

	a(user.isDemo, true);
	a(user.demoLastAccessed, 42);
	a(user.getDescriptor('isDemo').type, db.Boolean);
	a(user.getDescriptor('demoLastAccessed').type, UInteger);
};
