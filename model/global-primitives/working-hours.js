'use strict';

var memoize                = require('memoizee/plain')
  , defineGlobalPrimitives = require('./base')
  , defineUInteger         = require('dbjs-ext/number/integer/u-integer');

module.exports = memoize(function (db) {
	var globalPrimitives = defineGlobalPrimitives(db)
	  , UInteger         = defineUInteger(db);

	globalPrimitives.define('workingHours', {
		type: db.Object,
		nested: true
	});

	globalPrimitives.workingHours.defineProperties({
		start: {
			type: db.Object,
			nested: true
		},
		end: {
			type: db.Object,
			nested: true
		}
	});

	var hoursMinutesDefinition = {
		hours: {
			type: UInteger,
			max: 24
		},
		minutes: {
			type: UInteger,
			max: 59
		}
	};

	globalPrimitives.workingHours.start.defineProperties(hoursMinutesDefinition);
	globalPrimitives.workingHours.end.defineProperties(hoursMinutesDefinition);

	return globalPrimitives;
}, { normalizer: require('memoizee/normalizers/get-1')() });
