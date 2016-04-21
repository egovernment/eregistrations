/** The most common candidate for a section's super class.
 * This class should be extended by the section classes
 * which you define for single form which has just one group of fields.
 */

'use strict';

var memoize               = require('memoizee/plain')
  , validDb               = require('dbjs/valid-dbjs')
  , defineStringLine      = require('dbjs-ext/string/string-line')
  , defineFormSectionBase = require('./form-section-base')
  , defineProgressRule      = require('./lib/progress-rule');

module.exports = memoize(function (db) {
	var StringLine, FormSectionBase, ProgressRule;
	validDb(db);
	StringLine      = defineStringLine(db);
	FormSectionBase = defineFormSectionBase(db);
	ProgressRule    = defineProgressRule(db);
	FormSectionBase.extend('FormSection', {
		// Only for internal usage
		resolvedPropertyNames: {
			type: StringLine,
			multiple: true,
			value: function (_observe) {
				var props, resolved, masterPrefix, propertyMaster = this.propertyMaster;
				props = [];
				if (propertyMaster !== this.master) {
					if (propertyMaster.master !== this.master) {
						throw new Error("Defined propertyMaster must share master with defined formSection");
					}
					masterPrefix = propertyMaster.__id__.slice(this.master.__id__.length + 1) + '/';
				} else {
					masterPrefix = '';
				}
				this.propertyNames.forEach(function (name) {
					resolved = propertyMaster.resolveSKeyPath(name, _observe);
					if (!resolved) {
						return;
					}
					if (!resolved.object.hasPropertyDefined(resolved.key)) {
						throw new Error('Could not find property: ' + name);
					}
					props.push(masterPrefix + name);
				}, this);

				return props;
			}
		},
		// Only for internal usage
		formApplicablePropertyNames: { type: StringLine, multiple: true, value: function (_observe) {
			var result = [], resolved;

			this.resolvedPropertyNames.forEach(function (name) {
				resolved = this.master.resolveSKeyPath(name, _observe);
				if (!resolved) {
					return;
				}
				if (_observe(resolved.object['_' +
						this.database.Object.getFormApplicablePropName(resolved.key)])
						!== false) {
					result.push(name);
				}
			}, this);

			return result;
		} },
		// Only for internal usage
		applicablePropertyNames: { type: StringLine, multiple: true, value: function (_observe) {
			var props, resolved;
			props = this.formApplicablePropertyNames.copy();
			props.forEach(function (name) {
				resolved = this.master.resolveSKeyPath(name, _observe);
				if (!resolved) {
					return;
				}
				if (_observe(resolved.object['_' +
						this.database.Object.getApplicablePropName(resolved.key)])
						=== false) {
					props.delete(name);
				}
			}, this);

			return props;
		} },
		isPropertyFilled: {
			type: db.Function,
			value: function (resolved, _observe) {
				var owner     = resolved.object
				  , value     = resolved.value
				  , db        = this.database
				  , NestedMap = db.NestedMap
				  , File      = db.File;

				// NestedMap
				if (owner && NestedMap && (resolved.key === 'map') && (owner instanceof NestedMap)) {
					return Boolean(_observe(owner.ordered._size));
				}

				// Constrained Value
				if (value && (typeof value === 'object') && value.__id__ &&
						(typeof value.getDescriptor('resolvedValue')._value_ === 'function')) {
					return Boolean(_observe(value._resolvedValue));
				}

				// Simple multiple
				if (resolved.descriptor.multiple) return Boolean(_observe(resolved.observable).size);

				value = _observe(resolved.observable);
				if (value != null) {
					// File
					if (File && (value instanceof File)) {
						return Boolean(_observe(value._path));
					}

					// Simple value
					return true;
				}

				return false;
			}
		},
		missingRequiredPropertyNames: {
			type: StringLine,
			multiple: true,
			value: function (_observe) {
				var result = []
				  , resolved, isOwn;

				if (this.isUnresolved) {
					return this.resolventStatus < 1 ? [this.resolventProperty] : [];
				}

				this.applicablePropertyNames.forEach(function (name) {
					resolved = this.master.resolveSKeyPath(name, _observe);

					if (!resolved) return;
					if (this.isPropertyExcludedFromStatus(resolved, _observe)) return;

					if (!this.isPropertyFilled(resolved, _observe)) {
						result.push(name);
						return;
					}

					if (resolved.descriptor.requireOwn) {
						_observe(resolved.observable);

						if (resolved.descriptor.multiple) {
							isOwn = typeof resolved.descriptor._value_ !== 'function';
						} else {
							isOwn = resolved.descriptor._hasOwnValue_(resolved.object);
						}

						if (!isOwn) {
							result.push(name);
							return;
						}
					}
				}, this);

				return result;
			}
		},
		filledPropertyNames: {
			type: StringLine,
			multiple: true,
			value: function (_observe) {
				var result = []
				  , resolved;

				if (this.isResolventFilled(_observe)) result.push(this.resolventProperty);

				if (this.isUnresolved) return result;

				this.applicablePropertyNames.forEach(function (name) {
					resolved = this.master.resolveSKeyPath(name, _observe);

					if (!resolved) return;

					if (this.isPropertyFilled(resolved, _observe)) result.push(name);
				}, this);

				return result;
			}
		},
		hasDisplayableRuleDeep: {
			value: function (_observe) {
				return _observe(this.progressRules.displayable._size) > 0;
			}
		},
		hasMissingRequiredPropertyNamesDeep: {
			value: function (_observe) {
				return _observe(this.missingRequiredPropertyNames._size) > 0;
			}
		},
		hasFilledPropertyNamesDeep: {
			value: function (_observe) {
				return _observe(this.filledPropertyNames._size) > 0;
			}
		},
		// Used to set input options for form.
		// Note that in order to use it, you need to set every option separately i.e:
		// db.SomeFormClass.prototype.inputOptions.get('someProperty').set('disabled', true)
		inputOptions: {
			type: db.Object,
			nested: true
		},
		lastEditStamp: {
			value: function (_observe) {
				var res = 0, resolved, lastModified, propertiesToCheck;
				propertiesToCheck = this.resolvedPropertyNames.copy();
				if (this.resolventProperty) {
					propertiesToCheck.add(this.resolventProperty);
				}

				propertiesToCheck.forEach(function (name) {
					resolved = this.master.resolveSKeyPath(name, _observe);
					if (!resolved) {
						return;
					}
					lastModified = _observe(resolved.object['_' + resolved.key]._lastModified);
					if (lastModified > res) res = lastModified;
				}, this);

				return res;
			}
		},
		isPropertyExcludedFromStatus: {
			value: function (resolved, _observe) {
				return this.readOnlyPropertyNames.has(resolved.key) ||
					this.database.FormSectionBase.prototype.isPropertyExcludedFromStatus.call(this,
						resolved, _observe);
			}
		},
		// The names of the model fields which should be handled by this section.
		// Remember to write full property paths relative to the section's master object.
		// value example: ["name", "lastName", "address/street"]
		propertyNames: { type: StringLine, multiple: true },
		// The names of the model fields that should be treated as read only in this section.
		// It should contain the same elements as in propertyNames list. Listed properties will
		// not count towards progress and rendered not as inputs.
		readOnlyPropertyNames: { type: StringLine, multiple: true },
		toJSON: { type: db.Function, value: function (ignore) {
			var result = {
				label: this.label,
				lastEditDate: this.getOwnDescriptor('lastEditDate').valueToJSON()
			};
			var fields = [];
			if (this.resolventProperty) {
				fields.push(this.master.resolveSKeyPath(this.resolventProperty)
					.ownDescriptor.fieldToJSON());
			}
			if (!this.isUnresolved) {
				this.applicablePropertyNames.forEach(function (name) {
					var data = this.master.resolveSKeyPath(name), descriptor = data.ownDescriptor;
					if (!descriptor.type.isValueEmpty(data.value)) fields.push(descriptor.fieldToJSON());
				}, this);
			}
			if (fields.length) result.fields = fields;
			return result;
		} }
	});
	db.FormSection.prototype.inputOptions._descriptorPrototype_.nested = true;
	db.FormSection.prototype.inputOptions._descriptorPrototype_.type   = db.Object;

	db.FormSection.prototype.progressRules.map.define('missingFields', {
		type: ProgressRule,
		nested: true
	});

	db.FormSection.prototype.progressRules.map.missingFields.setProperties({
		progress: function (_observe) {
			var resolved, section, invalid, total = 0;
			section = this.owner.owner.owner;
			invalid = _observe(section.missingRequiredPropertyNames).size;

			if (!_observe(section._resolventStatus)) return 0;

			_observe(section.applicablePropertyNames).forEach(function (name) {
				resolved = section.master.resolveSKeyPath(name, _observe);

				if (!resolved) {
					++total;
					return;
				}

				if (section.isPropertyExcludedFromStatus(resolved, _observe)) return;

				++total;
			});

			return total === 0 ? 1 : (total - invalid) / total;
		},
		weight: function (_observe) {
			var resolved, section, resolvedResolvent, total = 0, isResolventExcluded;
			section = this.owner.owner.owner;
			if (section.resolventProperty) {
				resolvedResolvent = section.ensureResolvent(_observe);

				if (!resolvedResolvent) return 0;

				isResolventExcluded = section.isPropertyExcludedFromStatus(resolvedResolvent, _observe);
				if (_observe(resolvedResolvent.observable) !== _observe(section._resolventValue)) {
					return isResolventExcluded ? 0 : 1;
				}
				if (!isResolventExcluded) {
					++total;
				}
			}
			_observe(section.applicablePropertyNames).forEach(function (name) {
				resolved = section.master.resolveSKeyPath(name, _observe);
				if (!resolved) {
					++total;
					return;
				}
				if (section.isPropertyExcludedFromStatus(resolved, _observe)) {
					return;
				}
				++total;
			});
			return total;
		}
	});

	return db.FormSection;
}, { normalizer: require('memoizee/normalizers/get-1')() });
