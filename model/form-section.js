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
			var props;
			props = this.constructor.propertyNames.copy();
			props.forEach(function (name) {
				if (_observe(this.master.formPropertyApplicableMap.
						resolveSKeyPath(name).observable) === false) {
					props.delete(name);
				}
			}, this);

			return props;
		} },
		propertyNames: { type: StringLine, multiple: true, value: function (_observe) {
			var props;
			props = this.formPropertyNames.copy();
			props.forEach(function (name) {
				if (_observe(this.master.propertyApplicableMap.
						resolveSKeyPath(name).observable) === false) {
					props.delete(name);
				}
			}, this);

			return props;
		} }
	}, {
		propertyNames: { type: StringLine, multiple: true }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
