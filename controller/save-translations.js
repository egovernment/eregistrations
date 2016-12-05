'use strict';

var customError      = require('es5-ext/error/custom')
  , _                = require("mano").i18n.bind("Translations panel")
  , forEach          = require('es5-ext/object/for-each')
  , i18nScanMap      = require('mano').i18nScanMap
  , isArray          = require('es5-ext/array/is-plain-array')
  , resolvePluralKey = require('i18n2/resolve-plural-key')
  , compile          = require('es6-template-strings/compile')
  , arrayIncludes    = require('es5-ext/array/#/contains')
  , _d               = _
  , keysMismatchErrMsg  = _("Invalid translation for key: ${ key }\nBad inserts: ${ badInserts }")
  , curry            = require('es5-ext/function/#/curry')
  , stringify        = curry.call(JSON.stringify, 1)

  , create = Object.create;

if (!i18nScanMap) throw new Error("Translations map not set");

exports.validate = function (data) {
	var normalized = create(null);
	forEach(data, function (value, key) {
		var resolvedPluralKey, normalizedValue, keySubs, subs, badInserts = [];
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
		subs = compile(normalizedValue).substitutions;
		if (subs) {
			keySubs = compile(key).substitutions;
			if (!keySubs) {
				throw customError(_d(keysMismatchErrMsg,
					{ badInserts: subs.map(stringify), key: stringify(key) }),
					"INSERTS_MISMATCH");
			}
			keySubs = keySubs.map(function (keySub) {
				return keySub.trim();
			});
			subs = subs.map(function (sub) {
				return sub.trim();
			});
			subs.forEach(function (sub) {
				if (!arrayIncludes.call(keySubs, sub)) {
					badInserts.push(sub);
				}
			});

			if (badInserts.length) {
				throw customError(_d(keysMismatchErrMsg,
					{ badInserts: badInserts.map(stringify), key: stringify(key) }),
					"INSERTS_MISMATCH");
			}
		}

		normalized[key] = normalizedValue;
	});
	return normalized;
};
