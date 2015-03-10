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
		formPropertyNames: { type: StringLine, multiple: true, value: function (_observe) {
			var props, resolved;
			props = this.constructor.propertyNames.copy();
			props.forEach(function (name) {
				resolved = this.master.resolveSKeyPath(name, _observe);
				if (!resolved) {
					return;
				}
				if (_observe(resolved.object['_' +
						this.database.Object.getFormApplicablePropName(resolved.key)])
						=== false) {
					props.delete(name);
				}
			}, this);
			return props;
		} },
		propertyNames: { type: StringLine, multiple: true, value: function (_observe) {
			var props, resolved;
			props = this.formPropertyNames.copy();
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
			var resolved, valid = 0, total = 0, isOwn;
			if (this.constructor.resolventProperty) {
				resolved = this.master.resolveSKeyPath(this.constructor.resolventProperty, _observe);
				if (!resolved) {
					return 0;
				}
				if (_observe(resolved.observable) !== _observe(this.resolventValue)) {
					if (!resolved.descriptor.required) return 1;
					if (resolved.descriptor.multiple) {
						if (_observe(resolved.observable).size) return 1;
					} else {
						if (_observe(resolved.observable) != null) return 1;
					}
					return 0;
				}
			}
			this.propertyNames.forEach(function (name) {
				resolved = this.master.resolveSKeyPath(name, _observe);
				if (!resolved) {
					++total;
					return;
				}
				if (!resolved.descriptor.required) return;
				if (this.constructor.excludedFromStatusIfFilled.has(name) ||
						(!resolved.descriptor.multiple &&
							Object.getPrototypeOf(resolved.object).get(resolved.key) != null)) {
					if (resolved.descriptor.multiple) {
						if (_observe(resolved.observable).size) return;
					} else {
						if (_observe(resolved.observable) != null) return;
					}
				}
				++total;
				if (resolved.descriptor.requireOwn) {
					_observe(resolved.observable);
					if (resolved.descriptor.multiple) {
						isOwn = typeof resolved.descriptor._value_ !== 'function';
					} else {
						isOwn = resolved.descriptor._hasOwnValue_(resolved.object);
					}
					if (!isOwn) return;
				}
				if (resolved.descriptor.multiple && !_observe(resolved.observable).size) {
					return;
				}
				if (_observe(resolved.observable) != null) valid++;
			}, this);
			return total === 0 ? 1 : valid / total;
		} },
		weight: { value: function (_observe) {
			var resolved, total = 0;
			this.propertyNames.forEach(function (name) {
				resolved = this.master.resolveSKeyPath(name, _observe);
				if (!resolved) {
					++total;
					return;
				}
				if (!resolved.descriptor.required) return;
				if (this.constructor.excludedFromStatusIfFilled.has(name) ||
						(!resolved.descriptor.multiple &&
						Object.getPrototypeOf(resolved.object).get(resolved.key) != null)) {
					if (resolved.descriptor.multiple) {
						if (_observe(resolved.observable).size) return;
					} else {
						if (_observe(resolved.observable) != null) return;
					}
				}
				++total;
			}, this);
			return total;
		} },
		inputOptions: {
			type: db.Object,
			nested: true
		}
	}, {
		propertyNames: { type: StringLine, multiple: true }
	});
	db.FormSection.prototype.inputOptions._descriptorPrototype_.nested = true;
	db.FormSection.prototype.inputOptions._descriptorPrototype_.type   = db.Object;

	return db.FormSection;
}, { normalizer: require('memoizee/normalizers/get-1')() });
