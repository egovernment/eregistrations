// Requirement class

'use strict';

var memoize          = require('memoizee/plain')
  , validDb          = require('dbjs/valid-dbjs')
  , defineStringLine = require('dbjs-ext/string/string-line')
  , defineSubmission = require('./submission');

module.exports = memoize(function (db/*, options*/) {
	var StringLine, Submission, options = Object(arguments[1]);
	validDb(db);
	StringLine = defineStringLine(db);
	Submission = options.submissionClass || defineSubmission(db);

	return db.Object.extend('Requirement', {
		isApplicable: { type: db.Boolean, value: true },
		submissions: { type: Submission, multiple: true, value: function () {
			return [this.master.submissions[this.uniqueKey]];
		} },
		label: { type: StringLine, value: function () {
			if (!this.constructor.Document) return null;
			return this.constructor.Document.label;
		} },
		legend: { value: function () {
			if (!this.constructor.Document) return null;
			return this.constructor.Document.legend;
		} },
		uniqueKey: { value: function () { return this.key; } }
	}, {
		Document: { type: db.Base } //it's actually type: Type...but can't be defined like that now
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
