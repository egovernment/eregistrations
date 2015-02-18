'use strict';

var memoize            = require('memoizee/plain')
  , validDbType = require('dbjs/valid-dbjs-type')
  , endsWith    = require('es5-ext/string/#/ends-with');

module.exports = memoize(function (Target/* options */) {
	var db, options;
	validDbType(Target);
	db = Target.database;
	options = Object(arguments[1]);
	Target.prototype.defineProperties({
		requirements: {
			type: db.Object,
			nested: true
		}
	});

	if (options.classes) {
		options.classes.forEach(function (requirement) {
			if (!endsWith.call(requirement.__id__, "Requirement")) {
				throw new Error("Class: " + requirement.__id__ + " doesn't end with 'Requirement'." +
					" All requirement class names must end with 'Requirement'.");
			}
			Target.prototype.requirements.define(requirement.__id__[0].toLowerCase() +
				requirement.__id__.slice(1, -("Requirement".length)), {
					type: requirement,
					nested: true
				});
		});
	}

	return Target;
}, { normalizer: require('memoizee/normalizers/get-1')() });
