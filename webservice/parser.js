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

var pathDefinitionToPaths = function (bp, keyPath) {
	var resultPaths = [], currentPath = '', resolved, paths;
	paths = keyPath.split('/');
	paths.forEach(function (segment, index) {
		if (segment === '*') {
			currentPath += 'map/';
			resolved = bp.resolveSKeyPath(currentPath);
			if (!resolved || !resolved.value) return;
			resolved.value.forEach(function (item) { // each map item
				Array.prototype.push.apply(resultPaths,
					pathDefinitionToPaths(bp,
						currentPath + item.key + '/' + paths.slice(index + 1).join('/'))
					);
			});
			return; 
		}
		currentPath += segment;
		if (index === (paths.length - 1)) {
			if (paths.indexOf('*') !== -1) return; // handled by first block
			resultPaths.push(currentPath);
		} else {
			currentPath += '/';
		}
	});

	return resultPaths;
};

var prepareMap = function (bp, mapping/*, opts */) {
	var resultMap = {}, paths, opts, theirKeyPath, theirCurrentData, theirPathResolved, theirData, theirFinalPath;
	opts = Object(arguments[2]);
	theirData = opts.theirData;
	Object.keys(mapping).forEach(function (keyPath) {
		if (keyPath.indexOf('*') !== -1) { // a nested map
			paths = pathDefinitionToPaths(bp, keyPath);
			theirKeyPath = mapping[keyPath];
			delete mapping[keyPath];
			paths.forEach(function (ourKeyPath) {
				if (theirData) {
					theirCurrentData = theirData;
					theirFinalPath = '';
					ourKeyPath.split('map/').slice(1).map(function (segment) {
						return segment.split('/')[0];
					}).map(function (id) {
						theirPathResolved = theirKeyPath.replace(/\*/, '<ID>' + id);
					});
					theirPathResolved = theirPathResolved.split('/');
					theirPathResolved.every(function (theirSegment, index) {
						var itemId;
						if (theirSegment.indexOf('<ID>') === 0) {
							itemId = theirSegment.split('<ID>')[1];
							if (!Array.isArray(theirCurrentData)) {
								return false;
							}
							return theirCurrentData.some(function (item, itemIndex) {
								if (item.id === itemId) {
									theirCurrentData = theirCurrentData[itemIndex];
									theirFinalPath += itemIndex + '/';
									return true;
								};
							})
						}
						if ((index < theirPathResolved.length - 1) && !theirPathResolved[index]) return false;
						theirCurrentData = theirCurrentData[theirSegment];
						theirFinalPath += theirSegment + '/';
						return true;
					});
					if (theirFinalPath) {
						theirFinalPath = theirFinalPath.replace(/\/$/, '');
						resultMap[ourKeyPath] = theirFinalPath;
					} else {
						delete resultMap[ourKeyPath];
					}
				} else {
					resultMap[ourKeyPath] = mapping[keyPath];	
				}
			});
			return;
		}
		resultMap[keyPath] = mapping[keyPath];
	});

	return resultMap;
};

module.exports = exports = function (bp, mapping/*, options */) {
	var result = bp.toWebServiceJSON(), resolved, opts, theirData, preparedMap;
	result.request.data = {};
	opts = Object(arguments[2]);
	theirData = opts.theirData || null;
	preparedMap = prepareMap(bp, mapping, opts);
	Object.keys(preparedMap).forEach(function (keyPath) {
		var value, mapKey, map;
		if (!keyPath) return;
		resolved = bp.resolveSKeyPath(keyPath);
		if (!resolved || !resolved.descriptor) return;
		if (resolved.descriptor.multiple) { // a set
			return;
		}
		if (theirData && preparedMap[keyPath]) {
			value = getTheirValue(preparedMap[keyPath], theirData);
		} else {
			value = resolved.value;
		}
		assignDeep(result.request.data, setResultByKeyPath(keyPath, value));
	});

	return result;
};
