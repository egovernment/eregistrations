'use strict';

var memoize                = require('memoizee/plain')
  , defineGlobalPrimitives = require('./base')
  , defineDateType         = require('dbjs-ext/date-time/date')
  , today                  = new Date();

module.exports = memoize(function (db) {
	var globalPrimitives = defineGlobalPrimitives(db)
	  , DateType         = defineDateType(db);

	globalPrimitives.define('holidays', {
		type: DateType,
		multiple: true,
		min: new Date(),
		max: new Date(today.getFullYear() + 3, today.getMonth(), today.getDate())
	});

	return globalPrimitives;
}, { normalizer: require('memoizee/normalizers/get-1')() });
