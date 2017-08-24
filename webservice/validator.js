'use strict';

var getKeyPaths = function (object, result) {
	if (!result) result = [];
	if (!object || (typeof object !== 'object')) return;
	if (object.keyPath) {
		result.push({ keyPath: object.keyPath, value: object.value });
		return result;
	}
	if (Array.isArray(object)) {
		object.forEach(function (item) {
			getKeyPaths(item, result);
		});
	} else {
		Object.keys(object).forEach(function (key) {
			getKeyPaths(object[key], result);
		});
	}
	return result;
};

module.exports = function (bp, json) {
	var keyVals, result = [], resolved;
	keyVals = getKeyPaths(json);
	if (!keyVals) return result;
	keyVals.forEach(function (keyVal) {
		try {
			resolved = bp.resolveSKeyPath(keyVal.keyPath.slice(keyVal.keyPath.indexOf('/') + 1));
			resolved.object.getOwnDescriptor(resolved.sKey)._validateSetValue_(
				resolved.object,
				resolved.sKey,
				keyVal.value
			);
		} catch (e) {
			result.push(e);
		}
	});

	return result;
};
