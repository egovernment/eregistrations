'use strict';

var customError      = require('es5-ext/error/custom')
  , forEach          = require('es5-ext/object/for-each')
  , i18nScanMap      = require('mano').i18nScanMap
  , isArray          = require('es5-ext/array/is-plain-array')
  , resolvePluralKey = require('i18n2/resolve-plural-key')

  , create = Object.create;

if (!i18nScanMap) throw new Error("Translations map not set");

exports.validate = function (data) {
	var normalized = create(null);
	forEach(data, function (value, key) {
		var resolvedPluralKey, normalizedValue;
		if (!i18nScanMap[key]) return;
		if (isArray(value)) {
			if (value.length !== 2) {
				throw customError("Unexpected arity of plural translation", "I18N_UNEXPECTED_ARITY",
					{ statusCode: 401 });
			}
			resolvedPluralKey = resolvePluralKey(key);
			normalizedValue = [
				value[0] || resolvedPluralKey[0],
				value[1] || resolvedPluralKey[1]
			];
			if (('n\0' + normalizedValue[0] + '\0' + normalizedValue[1]) === key) return;
		} else {
			normalizedValue = value.trim();
			if (!normalizedValue) return;
			if (normalizedValue === key) return;
		}
		normalized[key] = normalizedValue;
	});
	return normalized;
};
