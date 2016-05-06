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
		// Used only in old BusinessProcess model (so just in Lomas)
		// To be removed when that dependency is removed
		businessProcessesDocuments: {
			type: Document,
			multiple: true,
			value: function (_observe) {
				var documents = [];

				this.businessProcesses.forEach(function (businessProcess) {
					_observe(businessProcess.documents).forEach(function (doc) {
						documents.push(doc);
					});
				});

				return documents;
			}
		}
	});

	return Target;
}, { normalizer: require('memoizee/normalizers/get-1')() });
