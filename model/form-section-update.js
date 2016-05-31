/** This class should be used as a super class for those section classes
 * which handle forms with more than one fields group.
 */

'use strict';

var memoize               = require('memoizee/plain')
  , validDb               = require('dbjs/valid-dbjs')
  , defineStringLine      = require('dbjs-ext/string/string-line')
  , defineFormSectionBase = require('./form-section-base')
  , defineProgressRule    = require('./lib/progress-rule');

module.exports = memoize(function (db) {
	var StringLine, FormSectionUpdate, FormSectionBase, ProgressRule;
	validDb(db);
	StringLine      = defineStringLine(db);
	FormSectionBase = defineFormSectionBase(db);
	ProgressRule    = defineProgressRule(db);
	FormSectionUpdate = FormSectionBase.extend('FormSectionUpdate', {
		label: {
			value: function (_observe) {
				if (!this.sourceSection) return;
				return _observe(this.sourceSection._label);
			}
		},
		actionUrl: {
			value: function (_observe) {
				if (!this.sourceSection) return;
				return _observe(this.sourceSection._actionUrl);
			}
		},
		legend: {
			value: function (_observe) {
				if (!this.sourceSection) return;
				return _observe(this.sourceSection._legend);
			}
		},
		sourceSectionPath: {
			type: StringLine,
			value: function () {
				return this.__id__.slice(this.__id__.indexOf('/') + 1)
					.replace(new RegExp('\/(.+?)' +
						this.database.FormSectionBase.updateSectionPostfix), '/$1');
			}
		},
		sourceSection: {
			type: FormSectionBase,
			value: function () {
				var resolved;
				resolved = this.master.resolveSKeyPath(this.sourceSectionPath);
				if (!resolved || !resolved.value) return;
				return resolved.value;
			}
		},
		originalSourceSection: {
			type: FormSectionBase,
			value: function () {
				if (!this.master.previousProcess) return;
				return this.master.previousProcess.resolveSKeyPath(this.sourceSectionPath).value;
			}
		},
		lastEditStamp: {
			value: function (_observe) {
				var res = 0, resolvedResolvent;

				if (this.resolventProperty) {
					resolvedResolvent = this.ensureResolvent(_observe);

					if (!resolvedResolvent) return;

					res = _observe(resolvedResolvent.object['_' + resolvedResolvent.key]._lastModified);
				}

				if (_observe(this.sourceSection._lastEditStamp) > res) {
					res = this.sourceSection.lastEditStamp;
				}

				return res;
			}
		},
		propertyNamesDeep: {
			value: function (_observe) {
				var result = [];
				if (this.resolventProperty) result.push(this.resolventProperty);

				_observe(this.sourceSection.propertyNamesDeep).forEach(function (property) {
					result.push(property);
				});

				return result;
			}
		},
		hasDisplayableRuleDeep: {
			value: function (_observe) {
				if (_observe(this.progressRules.displayable._size) > 0) return true;

				return _observe(this.sourceSection._hasDisplayableRuleDeep);
			}
		},
		hasMissingRequiredPropertyNamesDeep: {
			value: function (_observe) {
				if (this.isUnresolved) {
					return this.resolventStatus < 1;
				}

				return _observe(this.sourceSection._hasMissingRequiredPropertyNamesDeep);
			}
		},
		hasFilledPropertyNamesDeep: {
			value: function (_observe) {
				if (this.isResolventFilled(_observe)) return true;

				return _observe(this.sourceSection._hasFilledPropertyNamesDeep);
			}
		},
		toJSON: { value: function (ignore) {
			var result = this.commonToJSON();
			if (this.resolventProperty) {
				result.fields = [this.master.resolveSKeyPath(this.resolventProperty)
					.ownDescriptor.fieldToJSON()];
			}
			if (!this.isUnresolved && this.sourceSection.hasFilledPropertyNamesDeep) {
				result.sections = [this.sourceSection.toJSON()];
			}
			return result;
		} }
	});

	FormSectionUpdate.prototype.progressRules.map.define('sourceSection', {
		type: ProgressRule,
		nested: true
	});

	FormSectionUpdate.prototype.progressRules.map.sourceSection.setProperties({
		progress: function (_observe) {
			var sum = 0, resolvedResolvent, isResolventExcluded, section;
			section = this.owner.owner.owner;

			if (section.resolventProperty) {
				resolvedResolvent = section.ensureResolvent(_observe);

				if (!resolvedResolvent) return 0;

				isResolventExcluded = section.isPropertyExcludedFromStatus(resolvedResolvent, _observe);
				if (_observe(resolvedResolvent.observable) !== _observe(section._resolventValue)) {
					if (isResolventExcluded) return 1;

					if (resolvedResolvent.descriptor.multiple) {
						if (_observe(resolvedResolvent.observable).size) return 1;
					} else {
						if (_observe(resolvedResolvent.observable) != null) return 1;
					}

					return 0;
				}
				if (!isResolventExcluded) {
					++sum;
				}
			}
			if (section.sourceSection) {
				sum += (_observe(section.sourceSection._status) * _observe(section.sourceSection._weight));
			}

			if (!this.weight) return 1;

			return sum / this.weight;
		},
		weight: function (_observe) {
			var weightTotal = 0, resolvedResolvent, isResolventExcluded, section;
			section = this.owner.owner.owner;

			if (section.resolventProperty) {
				resolvedResolvent = section.ensureResolvent(_observe);

				if (!resolvedResolvent) return 0;

				isResolventExcluded = section.isPropertyExcludedFromStatus(resolvedResolvent, _observe);
				if (_observe(resolvedResolvent.observable) !== _observe(section._resolventValue)) {
					return isResolventExcluded ? 0 : 1;
				}

				if (!isResolventExcluded) {
					++weightTotal;
				}
			}

			if (section.sourceSection) {
				weightTotal += _observe(section.sourceSection._weight);
			}

			return weightTotal;
		}
	});

	return FormSectionUpdate;
}, { normalizer: require('memoizee/normalizers/get-1')() });
