'use strict';

var memoize     = require('memoizee/plain')
  , validDbType = require('dbjs/valid-dbjs-type')
  , defineDocument = require('../document')
  , defineSubmission  = require('../submission');

module.exports = memoize(function (Target/* options */) {
	var db, options, name, Submission, Document;
	validDbType(Target);
	db = Target.database;
	options = Object(arguments[1]);
	Submission = defineSubmission(db);
	Document = defineDocument(db);
	Target.prototype.defineProperties({
		submissions: {
			type: db.Object,
			nested: true
		}
	});

	if (options.classes) {
		options.classes.forEach(function (Doc) {
			name = Doc.__id__[0].toLowerCase() + Doc.__id__.slice(1);
			if (Object.getPrototypeOf(Doc) !== Document) {
				throw new Error("Class: " + Doc.__id__ + " must extend Document.");
			}
			Target.prototype.submissions.define(name, {
				type: Submission,
				nested: true
			});
			Target.prototype.submissions[name].getOwnDescriptor('document').type = Doc;
		});
	}

	return Target;
}, { normalizer: require('memoizee/normalizers/get-1')() });
