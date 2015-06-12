// Requirement class

'use strict';

var memoize                 = require('memoizee/plain')
  , defineStringLine        = require('dbjs-ext/string/string-line')
  , definePercentage        = require('dbjs-ext/number/percentage')
  , defineRequirementUpload = require('./requirement-upload')
  , defineSubmission        = require('./submission');

module.exports = memoize(function (db/*, options*/) {
	var StringLine = defineStringLine(db)
	  , Percentage = definePercentage(db)
	  , RequirementUpload = defineRequirementUpload(db)
	  , options = Object(arguments[1])
	  , Submission = options.submissionClass || defineSubmission(db);

	return db.Object.extend('Requirement', {
		// Document matching given requirement
		// Defined on prototype, as in most cases requirements will be defined classless way
		// Directly on businessProcess.requirements.map
		// Type is db.Base, as at this point there's no db.Type in dbjs
		// and we're not able to narrow it, to what is expected
		Document: { type: db.Base },
		// Requirement label (to be displayed in requirements list in guide)
		label: { type: StringLine, value: function () {
			var Document = this.Document || this.constructor.Document;
			if (!Document) {
				throw new Error("Cannot resolve label, as there's no document for " +
					JSON.stringify(this.key) + " requirement defined");
			}
			return Document.label;
		} },
		// Requirement legend (to be displayed in requirements list in guide)
		legend: { value: function () {
			var Document = this.Document || this.constructor.Document;
			if (!Document) return null;
			return Document.legend;
		} },

		// Wether requirement is applicable, used only to address corner cases e.g.:
		// "If both utilityBill and electricityBiil resolve from registrations, please
		// apply only electricityBill"
		isApplicable: { type: db.Boolean, value: true },

		// Uploads that resolve out of given requirement
		uploads: { type: RequirementUpload, multiple: true, value: function () {
			var upload = this.master.requirementUploads.map[this.key];
			if (!upload) {
				throw new Error("Cannot resolve " +
					JSON.stringify(this.key) + " requirementUpload out of businessProcess. " +
					"It seems it's not defined as expected");
			}
			return [upload];
		} },

		// Eventual progress status. Used when given requirement requires some decisions to be
		// made by user.
		// e.g. in ELS, there's a NRC registration, which displays a list of a potential documents to
		// upload, and user is required to choose which documents he wishes to upload
		guideProgress: { type: Percentage, value: 1 },

		// DEPRECATED PROPERTIES
		// To be removed once all systems that use that model rely on latest schema
		submissions: { type: Submission, multiple: true, value: function () {
			return [this.master.submissions[this.uniqueKey]];
		} },
		uniqueKey: { value: function () { return this.key; } }
	}, {
		Document: { type: db.Base }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
