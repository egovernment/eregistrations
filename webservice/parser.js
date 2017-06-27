'use strict';

var assignDeep = require('assign-deep');

var setResultByKeyPath = function (keyPath, value) {
	var result, paths = keyPath.split('/'), currentResult;
	currentResult = result = {};
	if (!paths.length) return;
	paths.forEach(function (segment, index) {
		currentResult[segment] = {};
		if (index === (paths.length - 1)) {
			currentResult[segment] = value;
		} else {
			currentResult = currentResult[segment];
		}
	});

	return result;
};

var getTheirValue = function (keyPath, theirData) {
	var currentData = theirData, paths = keyPath.split('/'), result;
	paths.every(function (segment, index) {
		// sanity check, don't parse if config path is invalid
		if ((index < (paths.length - 1)) && !currentData[segment]) return false;
		currentData = currentData[segment];
		if (index === (paths.length - 1)) {
			result = currentData;
		}

		return true;
	});

	return result;
};

module.exports = function (bp, mapping/*, options */) {
	var result = bp.toWebServiceJSON(), resolved, opts, theirData;
	result.request.data = {};
	opts = Object(arguments[2]);
	theirData = opts.theirData || null;
	Object.keys(mapping).forEach(function (keyPath) {
		var value;
		if (!keyPath) return; // perhaps non emptiness should be guaranteed here
		// special cases
		if (keyPath.indexOf('*') !== -1) { // a nested map
			if (keyPath.indexOf('*') === (keyPath.length - 1)) return; // ignore mapping to the map itself
			return;
		}
		resolved = bp.resolveSKeyPath(keyPath);
		if (!resolved || !resolved.descriptor) return;
		if (resolved.descriptor.multiple) { // a set
			return;
		}
		if (theirData && mapping[keyPath]) {
			value = getTheirValue(mapping[keyPath], theirData);
		} else {
			value = resolved.value;
		}
		assignDeep(result.request.data, setResultByKeyPath(keyPath, value));
	});

	return result;
};
