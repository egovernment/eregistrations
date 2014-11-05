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
	return FormSectionBase.extend('FormSection', {
		formPropertyNames: { type: StringLine, multiple: true, value: function (_observe) {
			var props, resolved;
			props = this.constructor.propertyNames.copy();
			props.forEach(function (name) {
				resolved = this.master.resolveSKeyPath(name);
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
				resolved = this.master.resolveSKeyPath(name);
				if (_observe(resolved.object['_' +
						this.database.Object.getApplicablePropName(resolved.key)])
						=== false) {
					props.delete(name);
				}
			}, this);

			return props;
		} },
		status: { value: function (_observe) {
			var resolved, valid = 0, total = 0;
			this.propertyNames.forEach(function (name) {
				resolved = this.master.resolveSKeyPath(name);
				if (_observe(resolved.object.getOwnDescriptor(name).required)) {
					total++;
					if (_observe(resolved.object['_' + resolved.key]) != null) {
						valid++;
					}
				}
			}, this);
			return total === 0 ? 1 : valid / total;
		} }
	}, {
		propertyNames: { type: StringLine, multiple: true }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
