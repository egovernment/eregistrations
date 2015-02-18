'use strict';

var memoize     = require('memoizee/plain')
  , validDbType = require('dbjs/valid-dbjs-type');

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
			if (submission.slice(-("Submission".length)) !== "Submission") {
				throw new Error("class: " + submission.__id__ + " doesn't end with 'Submission'." +
					" All submission class names must end with 'Submission'.");
			}
			Target.prototype.submissions.define(submission[0].toLowerCase() +
				submission.slice(1, -("Submission".length)), {
					type: db[submission],
					nested: true
				});
		});
	}

	return Target;
}, { normalizer: require('memoizee/normalizers/get-1')() });
