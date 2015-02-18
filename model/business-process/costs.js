'use strict';

var memoize          = require('memoizee/plain')
  , validDbType      = require('dbjs/valid-dbjs-type');

module.exports = memoize(function (Target/* options */) {
	var db, options;
	validDbType(Target);
	db = Target.database;
	options = Object(arguments[1]);

	Target.prototype.defineProperties({
		costs: {
			type: db.Object,
			nested: true
		}
	});

	if (options.classes) {
		options.classes.forEach(function (cost) {
			if (cost.slice(-("Cost".length)) !== "Cost") {
				throw new Error("class: " + cost.__id__ + " doesn't end with 'Cost'." +
					" All cost class names must end with 'Cost'.");
			}
			Target.prototype.costs.define(cost[0].toLowerCase() +
				cost.slice(1, -("Cost".length)), {
					type: db[cost],
					nested: true
				});
		});
	}

	return Target;
}, { normalizer: require('memoizee/normalizers/get-1')() });
