'use strict';

var memoize          = require('memoizee/plain')
  , validDb          = require('dbjs/valid-dbjs')
  , defineStringLine = require('dbjs-ext/string/string-line')
  , defineSubmission = require('./submission');

module.exports = memoize(function (db) {
	var StringLine, Submission;
	validDb(db);
	StringLine = defineStringLine(db);
	Submission = defineSubmission(db);
	db.Object.extend('Requirement', {
		isApplicable: { type: db.Boolean, value: true },
		submissions: { type: db.Object, nested: true },
		label: { type: StringLine, value: function () {
			if (!this.constructor.Document) return null;
			return this.constructor.Document.label;
		} }
	}, {
		Document: { type: db.Base } //it's actually type: Type...but can't be defined like that now
	});

	db.Requirement.prototype.submissions._descriptorPrototype_.type   = Submission;
	db.Requirement.prototype.submissions._descriptorPrototype_.nested = true;

	return db.Requirement;
}, { normalizer: require('memoizee/normalizers/get-1')() });
