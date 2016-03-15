'use strict';

var ensureDbjsObject = require('dbjs/valid-dbjs-object')
  , ensureArray      = require('es5-ext/array/valid-array');

module.exports = function (obj, paths) {
	ensureDbjsObject(obj);
	ensureArray(paths);
	return paths.filter(function (path) {
		var resolved;
		resolved = obj.resolveSKeyPath(path);
		return resolved && resolved.object.hasPropertyDefined(resolved.key);
	});
};
