'use strict';

var resolveJSONPath = require('./utils/resolve-json-path')
  , assignDeep = require('assign-deep');

var getResultByKeyPath = function (keyPath, value) {
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

var getTheirValue = function (theirKeyPath, theirData) {
	var currentData = theirData, paths = theirKeyPath.split('/'), result;
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

var setMultipleResult = function (resultJSON, ourKeyPath, theirKeyPath, theirData) {
	var ourKeyPathArr = ourKeyPath.split('/');
	var theirKeyPathArr = theirKeyPath.split('/');
	var ourCurrentResult = resultJSON;
	var ourCurrentPath = '';
	var ourResult;
	theirKeyPathArr.forEach(function (theirSegment, index) {
		if (theirSegment === '*') {
			if (!Array.isArray(theirData)) {
				throw new Error('Bad data for path: ' + theirKeyPath);
			}
			ourKeyPathArr.some(function (ourSegment) {
				if (ourSegment === '*') {
					ourResult = resolveJSONPath(exports.wsJSON, ourCurrentPath.slice(0, -1));
					if (!ourResult || !Array.isArray(ourResult)) {
						throw new Error('No data available');
					}
					return true;
				}
				ourCurrentPath += ourSegment + '/';
				ourCurrentResult = ourCurrentResult[ourSegment];
			});
			theirData.forEach(function (theirItem) {
				if (!theirItem.id) {
					throw new Error('No id for item at path: ' + theirKeyPath);
				}
				ourResult.some(function (ourItem) {
					if (!ourItem.id || ourItem.id !== theirItem.id) return;
					if (!ourCurrentResult) ourCurrentResult = [];
					var value = resolveJSONPath(theirItem, theirKeyPathArr.slice(index + 1).join('/'));
					var jsonSlice = getResultByKeyPath(
						ourKeyPathArr.slice(ourKeyPathArr.indexOf('*') + 1).join('/'),
						value
					);
					if (!ourCurrentResult.some(function (ourCurrentItem) {
							if (ourCurrentItem.id === theirItem.id) {
								assignDeep(ourCurrentItem, jsonSlice);
								return true;
							}
						})) {
						ourCurrentResult.push(assignDeep({ id: ourItem.id }, jsonSlice));
					}

					return true;
				});
			});
			if (ourCurrentResult && ourCurrentResult.length) {
				assignDeep(resultJSON, getResultByKeyPath(ourCurrentPath.slice(0, -1), ourCurrentResult));
			}
			return;
		}
		theirData = theirData[theirSegment];
	});
};

module.exports = exports = function (bp, mapping, theirData) {
	var result = bp.toWebServiceJSON();
	result = {};
	exports.wsJSON = bp.toWebServiceJSON({ includeFullMeta: true });
	Object.keys(mapping).forEach(function (keyPath) {
		var value;
		if (!keyPath) return;
		if (keyPath.indexOf('*') !== -1) {
			setMultipleResult(result, keyPath, mapping[keyPath], theirData);
		} else {
			if (mapping[keyPath]) {
				value = getTheirValue(mapping[keyPath], theirData);
			}
			assignDeep(result, getResultByKeyPath(keyPath, value));
		}
	});

	return result;
};

exports.wsJSON = null;
