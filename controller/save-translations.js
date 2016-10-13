'use strict';

var customError      = require('es5-ext/error/custom')
  , forEach          = require('es5-ext/object/for-each')
  , i18nScanMap      = require('mano').i18nScanMap
  , isArray          = require('es5-ext/array/is-plain-array')
  , resolvePluralKey = require('i18n2/resolve-plural-key')
  , compile          = require('es6-template-strings/compile')
  , arrayIncludes    = require('es5-ext/array/#/contains')
  , copy             = require('es5-ext/object/copy')
  , keysMismatchErr  =
		customError("The inserts in translation must match the inserts in the key", "INSERTS_MISMATCH")

  , create = Object.create;

if (!i18nScanMap) throw new Error("Translations map not set");

exports.validate = function (data) {
	var normalized = create(null);
	forEach(data, function (value, key) {
		var resolvedPluralKey, normalizedValue, keySubs, subs, mismatchErr;
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
			if (!(keySubs && subs)) {
				throw keysMismatchErr;
			}
			keySubs = keySubs.map(function (keySub) {
				return keySub.trim();
			});
			subs = subs.map(function (sub) {
				return sub.trim();
			});
			subs.forEach(function (sub) {
				if (!arrayIncludes.call(keySubs, sub)) {
					mismatchErr = copy(keysMismatchErr);
					mismatchErr.message += ', bad insert: ' + sub + ' in tranlsation: ' + normalizedValue;
					throw mismatchErr;
				}
			});
		}

		normalized[key] = normalizedValue;
	});
	return normalized;
};
