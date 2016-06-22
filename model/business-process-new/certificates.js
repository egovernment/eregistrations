// BusinessProcess certificates resolution

'use strict';

var memoize               = require('memoizee/plain')
  , defineMultipleProcess = require('../lib/multiple-process')
  , defineDataSnapshot    = require('../lib/data-snapshot')
  , defineDocument        = require('../document')
  , defineBusinessProcess = require('./registrations');

module.exports = memoize(function (db/* options */) {
	var BusinessProcess = defineBusinessProcess(db, arguments[1])
	  , MultipleProcess = defineMultipleProcess(db)
	  , Document        = defineDocument(db)
	  , DataSnapshot    = defineDataSnapshot(db);

	BusinessProcess.prototype.defineProperties({
		certificates: { type: MultipleProcess, nested: true }
	});

	BusinessProcess.prototype.certificates.map._descriptorPrototype_.type = Document;
	BusinessProcess.prototype.certificates.defineProperties({
		// Uploads data snapshot (saved when file is submitted to Part B)
		dataSnapshot: { type: DataSnapshot, nested: true },
		// Applicable certificates resolved out of requested registrations
		applicable: { type: Document, value: function (_observe) {
			var result = [];
			_observe(this.master.registrations.requested).forEach(function (registration) {
				_observe(registration.certificates).forEach(function (certificate) {
					result.push(certificate);
				});
			});
			return result;
		} },

		// Subset of applicable certificates for which document files were uploaded
		uploaded: { type: Document, multiple: true, value: function (_observe) {
			var result = [];
			this.applicable.forEach(function (certificate) {
				if (_observe(certificate.files.ordered._size)) result.push(certificate);
			});
			return result;
		} },
		// Subset of applicable certificate that were released
		// (its processing was approved and finalized)
		released: { type: Document, multiple: true, value: function (_observe) {
			return this.uploaded;
		} },
		// Subset of applicable certificates for which are electronic
		electronic: { type: Document, multiple: true, value: function (_observe) {
			var result = [];
			this.applicable.forEach(function (certificate) {
				if (_observe(certificate._isElectronic)) {
					result.push(certificate);
				}
			});
			return result;
		} },
		// Subset of applicable certificates for which are not electronic
		physical: { type: Document, multiple: true, value: function (_observe) {
			var result = [];
			this.applicable.forEach(function (certificate) {
				if (!_observe(certificate._isElectronic)) {
					result.push(certificate);
				}
			});
			return result;
		} },
		// Subset of uploaded certificates that can be handed out
		toBeHanded: { type: Document, multiple: true, value: function (_observe) {
			var result = [];
			this.uploaded.forEach(function (certificate) {
				if (_observe(certificate._isToBeHanded)) {
					result.push(certificate);
				}
			});
			return result;
		} },
		// Certificates that can be seen by user
		userApplicable: { type: Document, multiple: true, value: function (_observe) {
			if (!_observe(this.master._isApproved)) return null;

			return this.released;
		} },
		// It's for data snapshots functionality
		// Returns overview of gathered (or applied) certificates.
		// It is run on business process closure (no matter if rejection or approval)
		toJSON: { type: db.Function, value: function (ignore) {
			var result = [];
			this.applicable.forEach(function (document) { result.push(document.toJSON()); });
			return result;
		} }
	});

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
