// BusinessProcess certificates resolution

'use strict';

var memoize               = require('memoizee/plain')
  , defineMultipleProcess = require('../lib/multiple-process')
  , defineDocument        = require('../document')
  , defineBusinessProcess = require('./registrations');

module.exports = memoize(function (db/* options */) {
	var BusinessProcess = defineBusinessProcess(db, arguments[1])
	  , MultipleProcess = defineMultipleProcess(db)
	  , Document        = defineDocument(db);

	BusinessProcess.prototype.defineProperties({
		certificates: { type: MultipleProcess, nested: true }
	});

	BusinessProcess.prototype.certificates.map._descriptorPrototype_.type = Document;
	BusinessProcess.prototype.certificates.defineProperties({
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
		} }
	});

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
