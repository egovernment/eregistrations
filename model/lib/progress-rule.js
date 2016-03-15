/**
 * An Abstract class which serves as a base for section's progress objects.
 * Class represents section's single progress
 * (i.e min/max or entities completion)
 */

'use strict';

var memoize               = require('memoizee/plain')
  , ensureDb              = require('dbjs/valid-dbjs')
  , defineUInteger        = require('dbjs-ext/number/integer/u-integer')
  , definePercentage      = require('dbjs-ext/number/percentage')
  , defineGetTranslations = require('./define-get-translations');

module.exports = memoize(function (db/*, options*/) {
	var Percentage, UInteger, ProgressRule;

	ensureDb(db);
	Percentage = definePercentage(db);
	UInteger   = defineUInteger(db);

	ProgressRule = db.Object.extend('ProgressRule', {
		progress: { type: Percentage },
		weight: { type:  UInteger },
		isValid: {
			type: db.Boolean,
			value: function () {
				return this.progress === 1;
			}
		},
		message: {
			type: db.String
		},
		isApplicable: {
			type: db.Boolean,
			value: true
		}
	});

	return defineGetTranslations(ProgressRule);
}, { normalizer: require('memoizee/normalizers/get-1')() });
