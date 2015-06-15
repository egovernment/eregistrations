'use strict';

var memoize     = require('memoizee/plain')
  , validDbType = require('dbjs/valid-dbjs-type')
  , endsWith    = require('es5-ext/string/#/ends-with')
  , defineCost  = require('../cost');

module.exports = memoize(function (Target/* options */) {
	var Cost = defineCost(validDbType(Target).database)
	  , db = Target.database
	  , options = Object(arguments[1]);

	Target.prototype.defineProperties({
		costs: {
			type: db.Object,
			nested: true
		}
	});
	Target.prototype.costs._descriptorPrototype_.type = Cost;

	if (options.classes) {
		options.classes.forEach(function (cost) {
			if (!endsWith.call(cost.__id__, "Cost")) {
				throw new Error("Class: " + cost.__id__ + " doesn't end with 'Cost'." +
					" All cost class names must end with 'Cost'.");
			}
			Target.prototype.costs.define(cost.__id__[0].toLowerCase() +
				cost.__id__.slice(1, -("Cost".length)), {
					type: cost,
					nested: true
				});
		});
	}

	return Target;
}, { normalizer: require('memoizee/normalizers/get-1')() });
