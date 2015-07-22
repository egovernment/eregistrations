// Creates progress generic process resolution logic

'use strict';

var memoize               = require('memoizee/plain')
  , ensureDb              = require('dbjs/valid-dbjs')
  , defineUInteger        = require('dbjs-ext/number/integer/u-integer')
  , definePercentage      = require('dbjs-ext/number/percentage')
  , defineMultipleProcess = require('./multiple-process')
  , defineProgressRule    = require('./progress-rule');

module.exports = memoize(function (db/*, options*/) {
	var ProgressRule, ProgressRules, MultipleProcess, Percentage, UInteger;
	MultipleProcess = defineMultipleProcess(ensureDb(db));
	Percentage      = definePercentage(db);
	UInteger        = defineUInteger(db);
	ProgressRule    = defineProgressRule(db);
	ProgressRules   = MultipleProcess.extend('ProgressRules', {
		progress: {
			type: Percentage,
			value: function (_observe) {
				var progressSum = 0;
				this.applicable.forEach(function (progress) {
					progressSum += (_observe(progress._progress) * _observe(progress._weight));
				});

				if (!this.weight) return 1;
				return progressSum / this.weight;
			}
		},
		weight: {
			type:  UInteger,
			value: function (_observe) {
				var weightSum = 0;
				this.applicable.forEach(function (progress) {
					weightSum += _observe(progress._weight);
				});

				return weightSum;
			}
		},
		valid: {
			type: ProgressRule,
			multiple: true,
			value: function (_observe) {
				var result = [];
				this.applicable.forEach(function (progress) {
					var isValid = progress._get ? _observe(progress._isValid) :
							progress.isValid;
					if (isValid) result.push(progress);
				});
				return result;
			}
		},
		invalid: {
			type: ProgressRule,
			multiple: true,
			value: function (_observe) {
				var result = [];
				this.applicable.forEach(function (progress) {
					var isInvalid = progress._get ? !_observe(progress._isValid) :
							!progress.isValid;
					if (isInvalid) result.push(progress);
				});
				return result;
			}
		},
		applicable: {
			value: function (_observe) {
				var result = [];
				this.map.forEach(function (progress) {
					var isApplicable = progress._get ? _observe(progress._isApplicable) :
							progress.isApplicable;
					if (isApplicable) result.push(progress);
				});
				return result;
			}
		}
	});
	return ProgressRules;
}, { normalizer: require('memoizee/normalizers/get-1')() });
