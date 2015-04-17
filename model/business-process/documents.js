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
			value: function () {
				var documents = [];

				this.requestedCertificates.forEach(function (cert) {
					documents.push(this.certificates[cert]);
				});
				this.applicableSubmissions.forEach(function (sub) {
					documents.push(sub.document);
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

				return documents;
			}
		}
	});

	return Target;
}, { normalizer: require('memoizee/normalizers/get-1')() });
