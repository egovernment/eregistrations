'use strict';

var memoize            = require('memoizee/plain')
  , validDb            = require('dbjs/valid-dbjs')
  , defineUser         = require('mano-auth/model/user')
  , defineSubmission   = require('../submission');

module.exports = memoize(function (db) {
	var User, Submission;
	validDb(db);
	User = defineUser(db);
	Submission = defineSubmission(db);
	User.prototype.defineProperties({
		submissions: {
			type: db.Object,
			nested: true
		}
	});

	User.prototype.submissions._descriptorPrototype_.type   = Submission;
	User.prototype.submissions._descriptorPrototype_.nested = true;

	return db.User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
