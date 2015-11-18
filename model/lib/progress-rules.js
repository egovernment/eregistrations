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
				this.applicable.forEach(function (rule) {
					progressSum += (_observe(rule._progress) * _observe(rule._weight));
				});

				if (!this.weight) return 1;
				return progressSum / this.weight;
			}
		},
		weight: {
			type:  UInteger,
			value: function (_observe) {
				var weightSum = 0;
				this.applicable.forEach(function (rule) {
					weightSum += _observe(rule._weight);
				});

				return weightSum;
			}
		},
		displayable: {
			type: ProgressRule,
			multiple: true,
			value: function (_observe) {
				var result = [];
				this.invalid.forEach(function (rule) {
					if (rule.message) result.push(rule);
				});
				return result;
			}
		},
		invalid: {
			type: ProgressRule,
			multiple: true,
			value: function (_observe) {
				var result = [];
				this.applicable.forEach(function (rule) {
					var isInvalid = rule._get ? !_observe(rule._isValid) :
							!rule.isValid;
					if (isInvalid) result.push(rule);
				});
				return result;
			}
		}
	});
	return ProgressRules;
}, { normalizer: require('memoizee/normalizers/get-1')() });
