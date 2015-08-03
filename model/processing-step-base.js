// Processing step base class
// It is extended either by ProcessingStep or ProcessingStepGroup
// Describes the process of official role (like revision, processing or front desk)

'use strict';

var memoize           = require('memoizee/plain')
  , defineStringLine  = require('dbjs-ext/string/string-line')
  , defineCreateEnum  = require('dbjs-ext/create-enum')
  , defineInstitution = require('./institution');

module.exports = memoize(function (db) {
	var StringLine = defineStringLine(db)
	  , Institution = defineInstitution(db);

	defineCreateEnum(db);

	return db.Object.extend('ProcessingStepBase', {
		// Label (name) of processing step
		label: { type: StringLine },
		// If step is processed by single institution
		// then instution should be exposed here
		institution: { type: Institution },

		// Whether given step applies at all
		isApplicable: { type: db.Boolean, value: true },
		// Whether business process is at given step or have passed it
		isReady: { type: db.Boolean, value: function (_observe) {
			return Boolean(_observe(this.master._isSubmitted) && this.isApplicable);
		} },

		// Whether process is pending at step
		isPending: { type: db.Boolean },

		// Whether process is paused at step
		isPaused: { type: db.Boolean },

		// Whether process was sent back from this step
		isSentBack: { type: db.Boolean },

		// Whether process was rejected at this step
		isRejected: { type: db.Boolean },

		// Whether process successfully passed this step
		isApproved: { type: db.Boolean },

		// Whether processing of this step has ended
		isClosed: { type: db.Boolean, value: function (_observe) {
			return this.isApproved || this.isRejected || false;
		} }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
