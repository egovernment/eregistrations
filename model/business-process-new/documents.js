// Defines documents collections
// It's used for My Account interface, where we display all documents together
// (uploaded requirements and certificates)

'use strict';

var memoize        = require('memoizee/plain')
  , defineDocument = require('../document')
  , defineInitial  = require('./base');

module.exports = memoize(function (db/*, options*/) {
	var Document = defineDocument(db), BusinessProcess = defineInitial(db, arguments[1]);

	BusinessProcess.prototype.defineProperties({ documents: { type: db.Object, nested: true } });
	BusinessProcess.prototype.documents.defineProperties({
		// All documents (requirements and certificates) uploaded in a process
		uploaded: { type: Document, multiple: true, value: function (_observe) {
			var documents = [];

			_observe(this.certificates.uploaded).forEach(function (certificate) {
				documents.push(certificate);
			});
			_observe(this.requirementUploads.uploaded).forEach(function (requirementUpload) {
				documents.push(requirementUpload.document);
			});

			return documents.sort(function (a, b) {
				return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
			});
		} },
		// All documents (requirements and certificates) uploaded in this business process chain
		multiProcessUploaded: { type: Document, multiple: true, value: function (_observe) {
			var processes = [this.master], documents = [], taken = Object.create(null);

			// Gather all business processes in chain
			_observe(this.master.derivedBusinessProcesses).forEach(function (process) {
				processes.push(process);
			});
			// Iterate processes in reverse order (latest one should be considered first);
			processes.reverse().forEach(function (process) {
				_observe(process.documents.uploaded).forEach(function (document) {
					if (taken[document.uniqueKey]) return;
					taken[document.uniqueKey] = true;
					documents.push(document);
				});
			});

			return documents.sort(function (a, b) {
				return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
			});
		} }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
