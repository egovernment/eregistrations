// Defines documents collections
// It's used for My Account interface, where we display all documents together
// (uploaded requirements and certificates)

'use strict';

var memoize               = require('memoizee/plain')
  , defineDocument        = require('../document')
  , defineBusinessProcess = require('./derived');

module.exports = memoize(function (db/*, options*/) {
	var BusinessProcess = defineBusinessProcess(db, arguments[1])
	  , Document        = defineDocument(db);

	BusinessProcess.prototype.defineProperties({ documents: { type: db.Object, nested: true } });
	BusinessProcess.prototype.documents.defineProperties({
		// All documents (requirements and certificates) uploaded in a process
		uploaded: { type: Document, multiple: true, value: function (_observe) {
			var documents = [];

			_observe(this.master.certificates.uploaded).forEach(function (certificate) {
				documents.push(certificate);
			});
			_observe(this.master.requirementUploads.uploaded).forEach(function (requirementUpload) {
				documents.push(requirementUpload.document);
			});

			return documents.sort(function (a, b) {
				return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
			});
		} },
		// All documents (requirements and certificates) uploaded in this business process chain
		processChainUploaded: { type: Document, multiple: true, value: function (_observe) {
			return this.uploaded;
		} }
	});

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
