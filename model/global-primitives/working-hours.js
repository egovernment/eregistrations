'use strict';

var memoize                = require('memoizee/plain')
  , defineGlobalPrimitives = require('./base')
  , defineUInteger         = require('dbjs-ext/number/integer/u-integer')
  , _                      = require('mano').i18n.bind('Model');

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
			label: _("Hours"),
			type: UInteger,
			max: 23
		},
		minutes: {
			label: _("Minutes"),
			type: UInteger,
			max: 59,
			value: 0
		}
	};

	globalPrimitives.workingHours.start.defineProperties(hoursMinutesDefinition);
	globalPrimitives.workingHours.end.defineProperties(hoursMinutesDefinition);

	globalPrimitives.workingHours.start.hours = 8;
	globalPrimitives.workingHours.end.hours   = 16;

	return globalPrimitives;
}, { normalizer: require('memoizee/normalizers/get-1')() });
