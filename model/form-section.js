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
				if (_observe(resolved.object['_' + db.Object.getFormApplicablePropName(resolved.key)])
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
				if (_observe(resolved.object['_' + db.Object.getApplicablePropName(resolved.key)])
						=== false) {
					props.delete(name);
				}
			}, this);

			return props;
		} }
	}, {
		propertyNames: { type: StringLine, multiple: true }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
