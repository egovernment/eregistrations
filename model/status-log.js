'use strict';

var memoize            = require('memoizee/plain')
  , defineUser         = require('mano-auth/model/user')
  , defineRegistration = require('./registration')
  , validDbType        = require('dbjs/valid-dbjs-type')
  , defineStringLine   = require('dbjs-ext/string/string-line');

module.exports = memoize(function (Target) {
	var StringLine, User, Registration, db;
	validDbType(Target);
	db = Target.database;
	StringLine = defineStringLine(db);
	User       = defineUser(db);
	Registration = defineRegistration(db);

	if (!db.StatusLog) {
		db.Object.extend('StatusLog', {
			label: { type: StringLine, required: true },
			registration: { type: Registration },
			time: { type: db.DateTime, required: true },
			official: { type: User },
			text: { type: db.String, required: true }
		});
	}

	Target.prototype.define('statusLog', { type: db.StatusLog, multiple: true });

	return db.StatusLog;
}, { normalizer: require('memoizee/normalizers/get-1')() });
