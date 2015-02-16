'use strict';

var memoize          = require('memoizee/plain')
  , validDbType      = require('dbjs/valid-dbjs-type')
  , defineStringLine = require('dbjs-ext/string/string-line');

module.exports = memoize(function (Target) {
	var StringLine;
	validDbType(Target);
	StringLine = defineStringLine(Target.database);

	Target.prototype.defineProperties({
		costs: {
			type: StringLine,
			multiple: true,
			value: function () {
				var costs = [];
				this.requestedRegistrations.forEach(function (regName) {
					var userRegistration =  this.registrations[regName];
					userRegistration.costs.forEach(function (cost) {
						costs.push(cost);
					});
				}, this);
				return costs;
			}
		}
	});

	return Target;
}, { normalizer: require('memoizee/normalizers/get-1')() });
