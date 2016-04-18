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
		toJSON: { type: db.Function, value: function (ignore) {
			var result = [];
			this.applicable.forEach(function (document) {
				var data;
				result.push(data = {
					key: document.key,
					label: this.database.resolveTemplate(document.label, document.getTranslations(),
						{ partial: true }),
					issuedBy: document.getOwnDescriptor('issuedBy').valueTOJSON(),
					issuedDate: document.getOwnDescriptor('issueDate').valueTOJSON(),
					number: document.getOwnDescriptor('issueDate').valueTOJSON()
				});
				var files = [];
				document.files.ordered.forEach(function (file) { files.push(file.toJSON()); });
				if (files.length) data.files = files;
				if (document.dataForm.constructor !== this.database.FormSectionBase) {
					data.section = document.dataForm.toJSON();
					// Strip `files/map` property, we don't want it in overview
					(function self(data) {
						if (data.fields) {
							data.fields = data.fields.filter(function (field) {
								return !field.id.match(/\/files\/map$/);
							});
						}
						if (data.sections) data.sections.forEach(self);
					}(data.section));
				}
			}, this);
			return result;
		} }
	});

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
