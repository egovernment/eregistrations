'use strict';

var memoize        = require('memoizee/plain')
  , defineDocument = require('../document')
  , validDbType    = require('dbjs/valid-dbjs-type');

module.exports = memoize(function (Target/* options */) {
	var db, options, Document;
	validDbType(Target);
	options = Object(arguments[1]);
	db      = Target.database;
	Document = defineDocument(db, options);
	Target.prototype.defineProperties({
		documents: {
			type: Document,
			multiple: true,
			value: function (_observe) {
				var documents = [];

				this.requestedCertificates.forEach(function (cert) {
					if (_observe(this.certificates[cert].files.ordered._size)) {
						documents.push(this.certificates[cert]);
					}
				}, this);
				this.applicableSubmissions.forEach(function (sub) {
					if (_observe(sub.document.files.ordered._size)) {
						documents.push(sub.document);
					}
				});

				documents.sort(function (a, b) {
					return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
				});

				return documents;
			}
		},
		cumulatedDocuments: {
			type: Document,
			multiple: true,
			value: function () {
				var documents = [], derivedDocs = [], documentNames = {}, filter;

				filter = function (doc) {
					if (!documentNames[doc.uniqueKey]) {
						documentNames[doc.uniqueKey] = true;
						documents.push(doc);
					}
				};

				this.derivedBusinessProcesses.forEach(function (derived) {
					derived.documents.forEach(function (doc) {
						derivedDocs.push(doc);
					});
				});
				derivedDocs.reverse().forEach(filter);
				this.documents.forEach(filter);

				documents.sort(function (a, b) {
					return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
				});

				return documents;
			}
		}
	});

	return Target;
}, { normalizer: require('memoizee/normalizers/get-1')() });
