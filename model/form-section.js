/** The most common candidate for a section's super class.
 * This class should be extended by the section classes
 * which you define for single form which has just one group of fields.
 */

'use strict';

var memoize               = require('memoizee/plain')
  , validDb               = require('dbjs/valid-dbjs')
  , defineStringLine      = require('dbjs-ext/string/string-line')
  , defineFormSectionBase = require('./form-section-base');

module.exports = memoize(function (db) {
	var StringLine, FormSectionBase;
	validDb(db);
	StringLine      = defineStringLine(db);
	FormSectionBase = defineFormSectionBase(db);
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
		status: { value: function (_observe) {
			var resolved, invalid = _observe(this.missingRequiredPropertyNames).size, total = 0;

			if (!this.resolventStatus) return 0;

			this.applicablePropertyNames.forEach(function (name) {
				resolved = this.master.resolveSKeyPath(name, _observe);

				if (!resolved) {
					++total;
					return;
				}

				if (this.isPropertyExcludedFromStatus(resolved, _observe)) return;

				++total;
			}, this);

			return total === 0 ? 1 : (total - invalid) / total;
		} },
		missingRequiredPropertyNames: {
			type: StringLine,
			multiple: true,
			value: function (_observe) {
				var resolved, resolvedResolvent, isResolventExcluded, isOwn, db = this.database,
					File = db.File, NestedMap = db.NestedMap, result = [];

				if (this.resolventProperty) {
					resolvedResolvent = this.ensureResolvent(_observe);

					if (!resolvedResolvent) return result;

					isResolventExcluded = this.isPropertyExcludedFromStatus(resolvedResolvent, _observe);

					if (_observe(resolvedResolvent.observable) !== _observe(this.resolventValue)) {
						if (isResolventExcluded) return result;

						if (resolvedResolvent.descriptor.multiple) {
							if (_observe(resolvedResolvent.observable).size) return result;
						} else {
							if (_observe(resolvedResolvent.observable) != null) return result;
						}

						return [this.resolventProperty];
					}
				}

				this.applicablePropertyNames.forEach(function (name) {
					var value;
					resolved = this.master.resolveSKeyPath(name, _observe);

					if (!resolved) return;
					if (this.isPropertyExcludedFromStatus(resolved, _observe)) return;

					if (resolved.object && NestedMap && (resolved.key === 'map')
							&& (resolved.object instanceof NestedMap)) {
						if (!_observe(resolved.object.ordered._size)) result.push(name);

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

					if (resolved.descriptor.multiple && !_observe(resolved.observable).size) {
						result.push(name);
						return;
					}

					value = _observe(resolved.observable);

					if (value != null) {
						if (File && (value instanceof File)) {
							value = _observe(value._path);

							if (value == null) result.push(name);
						}
					} else {
						result.push(name);
					}
				}, this);

				return result;
			}
		},
		weight: { value: function (_observe) {
			var resolved, resolvedResolvent, total = 0, isResolventExcluded;
			if (this.resolventProperty) {
				resolvedResolvent = this.ensureResolvent(_observe);

				if (!resolvedResolvent) return 0;

				isResolventExcluded = this.isPropertyExcludedFromStatus(resolvedResolvent, _observe);
				if (_observe(resolvedResolvent.observable) !== _observe(this.resolventValue)) {
					return isResolventExcluded ? 0 : 1;
				}
				if (!isResolventExcluded) {
					++total;
				}
			}
			this.applicablePropertyNames.forEach(function (name) {
				resolved = this.master.resolveSKeyPath(name, _observe);
				if (!resolved) {
					++total;
					return;
				}
				if (this.isPropertyExcludedFromStatus(resolved, _observe)) {
					return;
				}
				++total;
			}, this);
			return total;
		} },
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
		// The names of the model fields which should be handled by this section.
		// Remember to write full property paths relative to the section's master object.
		// value example: ["name", "lastName", "address/street"]
		propertyNames: { type: StringLine, multiple: true }
	});
	db.FormSection.prototype.inputOptions._descriptorPrototype_.nested = true;
	db.FormSection.prototype.inputOptions._descriptorPrototype_.type   = db.Object;

	return db.FormSection;
}, { normalizer: require('memoizee/normalizers/get-1')() });
