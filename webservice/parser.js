'use strict';

var isPathValid = function (obj, path) {
	var splitPath = path.split('/'), currentBranch = obj;
	return splitPath.every(function (segment) {
		if (segment === '*') {
			if (!Array.isArray(currentBranch)) return false;
			if (!currentBranch.length) return false;
			currentBranch = currentBranch[0];
		} else {
			if (!currentBranch.hasOwnProperty(segment)) return false;
			currentBranch = currentBranch[segment];
		}
		return true;
	});
};

var unStarPath = function (obj, path, result) {
	var pathSplit = path.split('/'), currentPath = '', currentObj;
	currentObj = obj;
	if (!result) result = [];
	if (path.indexOf('*') === -1) {
		result.push(path);
		return result;
	}
	pathSplit.forEach(function (segment, index) {
		if (segment === '*') {
			if (!currentObj) return;
			currentObj.forEach(function (item) {
				if (!item.id) return;
				var itemPath =  '<ID>' + item.id + '<END ID>';
				unStarPath(item, pathSplit.slice(index + 1).join('/')).forEach(
					function (partialPath) {
						result.push(currentPath + '/' + itemPath + '/' + partialPath);
					}
				);
			});
		}
		if (!currentObj) return;
		currentObj = currentObj[segment];
		currentPath += (index === 0 ? '' : '/') + segment;
	});

	return result;
};

var mapItemPaths = function (ourPaths, theirPaths, pathDefinition) {
	var result = {};
	ourPaths.forEach(function (ourPath) {
		var ids = ourPath.match(/<ID>.+?<END ID>/g);
		var theirPath = pathDefinition[ourPath.replace(/<ID>.+?<END ID>/g, '*')];
		ids.forEach(function (id) {
			theirPath = theirPath.replace('*', id);
		});
		if (theirPaths.indexOf(theirPath) !== -1) {
			result[ourPath] = theirPath;
		}
	});

	return result;
};

var assignValues = function (pathsMap, ourData, theirData) {
	var currentResult, result, theirCurrentData, ourPathSplit
	  , theirPath, theirPathSplit, lastSegment;
	currentResult = result = {};

	Object.keys(pathsMap).forEach(function (ourPath) {
		currentResult = result;
		ourPathSplit = ourPath.split('/');
		ourPathSplit.forEach(function (segment, i) {
			if (segment.indexOf('<ID>') !== -1) {
				var id = segment.replace('<ID>', '').replace('<END ID>', ''), matchingIndex = null;

				currentResult.some(function (item, index) {
					if (item.id === id) {
						matchingIndex = index;
						return true;
					}
				});
				if (matchingIndex == null) {
					matchingIndex = (currentResult.push({ id: id }) - 1);
				}
				currentResult = currentResult[matchingIndex];
				return;
			}
			if (!currentResult[segment]) {
				if (ourPathSplit[i + 1] && (ourPathSplit[i + 1].indexOf('<ID>') !== -1)) {
					currentResult[segment] = [];
				} else {
					currentResult[segment] = {};
				}
			}
			if (i === (ourPathSplit.length - 1)) {
				lastSegment = segment;
			} else {
				currentResult = currentResult[segment];
			}
		});
		theirCurrentData = theirData;
		theirPath = pathsMap[ourPath];
		theirPathSplit = theirPath.split('/');
		theirPathSplit.forEach(function (segment) {
			if (segment.indexOf('<ID>') !== -1) {
				var id = segment.replace('<ID>', '').replace('<END ID>', '');
				return theirCurrentData.some(function (item, index) {
					if (item.id === id) {
						theirCurrentData = theirCurrentData[index];
						return true;
					}
				});
			}
			theirCurrentData = theirCurrentData[segment];
		});
		currentResult[lastSegment] = theirCurrentData;
	});

	return result;
};

module.exports = function (bp, inputMap, theirData) {
	var filteredMap = {};
	exports.wsJSON = bp.toWebServiceJSON();
	Object.keys(inputMap).forEach(function (mapKey) {
		if (!isPathValid(exports.wsJSON, mapKey)) return;
		if (!isPathValid(theirData, inputMap[mapKey])) return;
		if (mapKey.indexOf('*') !== -1) {
			Object.assign(filteredMap,
				mapItemPaths(unStarPath(exports.wsJSON, mapKey),
					unStarPath(theirData, inputMap[mapKey]), inputMap));
		} else {
			filteredMap[mapKey] = inputMap[mapKey];
		}
	});
	return assignValues(filteredMap, exports.wsJSON, theirData);
};

exports.wsJSON = null;
