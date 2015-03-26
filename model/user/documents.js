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

				this.businessProcesses.forEach(function (businessProcess) {
					_observe(businessProcess.requestedCertificates).forEach(function (cert) {
						documents.push(businessProcess.certificates[cert]);
					});
					_observe(businessProcess.applicableSubmissions).forEach(function (sub) {
						documents.push(sub.document);
					});
				});

				return documents;
			}
		}
	});

	return Target;
}, { normalizer: require('memoizee/normalizers/get-1')() });
