'use strict';

var ensureDbjsObject = require('dbjs/valid-dbjs-object')
  , ensureArray      = require('es5-ext/array/valid-array')
  , filter           = require('es5-ext/array/#/filter');

module.exports = function (obj, paths) {
	ensureDbjsObject(obj);
	ensureArray(paths);
	return filter.call(paths, function (path) {
		var resolved;
		resolved = obj.resolveSKeyPath(path);
		return resolved && resolved.object.hasPropertyDefined(resolved.key);
	});
};
