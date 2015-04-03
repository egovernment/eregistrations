'use strict';

var memoize     = require('memoizee/plain')
  , validDbType = require('dbjs/valid-dbjs-type')
  , defineDocument = require('../document');

module.exports = memoize(function (Target/*, options */) {
	var db, options, Document;
	validDbType(Target);
	db = Target.database;
	Document = defineDocument(db);
	options = Object(arguments[1]);
	Target.prototype.defineProperties({
		certificates: {
			type: db.Object,
			nested: true
		}
	});

	if (options.classes) {
		options.classes.forEach(function (Certificate) {
			if (!Document.isPrototypeOf(Certificate)) {
				throw new Error("Class: " + Certificate.__id__ + " must extend Document.");
			}
			Target.prototype.certificates.define(Certificate.__id__[0].toLowerCase() +
				Certificate.__id__.slice(1), {
					type: Certificate,
					nested: true
				});
		});
	}

	return Target;
}, { normalizer: require('memoizee/normalizers/get-1')() });
