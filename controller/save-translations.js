'use strict';

var customError      = require('es5-ext/error/custom')
  , forEach          = require('es5-ext/object/for-each')
  , i18ScanMap       = require('../../i18n-scan-map.generated')
  , isArray          = require('es5-ext/array/is-plain-array')
  , resolvePluralKey = require('i18n2/resolve-plural-key')
  , _                = require('mano').i18n.bind('Controller')

  , create = Object.create;

exports.validate = function (data) {
	var normalized = create(null);
	if (!i18ScanMap) {
		throw customError(_("Translations map is not available"), "NO_I18N_MAP", { statusCode: 401 });
	}
	forEach(data, function (value, key) {
		var resolvedPluralKey, normalizedValue;
		if (!i18ScanMap[key]) return;
		if (isArray(value)) {
			if (value.length !== 2) {
				throw customError(_("Unexpected arity of plural translation"),
					"I18N_UNEXPECTED_ARITY", { statusCode: 401 });
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
