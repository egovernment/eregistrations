'use strict';

var memoize     = require('memoizee/plain')
  , validDbType = require('dbjs/valid-dbjs-type')
  , endsWith    = require('es5-ext/string/#/ends-with');

module.exports = memoize(function (Target/* options */) {
	var db, options;
	validDbType(Target);
	db = Target.database;
	options = Object(arguments[1]);
	Target.prototype.defineProperties({
		submissions: {
			type: db.Object,
			nested: true
		}
	});

	if (options.classes) {
		options.classes.forEach(function (submission) {
			if (endsWith.call(submission.__id__, "Submission")) {
				throw new Error("Class: " + submission.__id__ + " doesn't end with 'Submission'." +
					" All submission class names must end with 'Submission'.");
			}
			Target.prototype.submissions.define(submission.__id__[0].toLowerCase() +
				submission.__id__.slice(1, -("Submission".length)), {
					type: submission,
					nested: true
				});
		});
	}

	return Target;
}, { normalizer: require('memoizee/normalizers/get-1')() });
