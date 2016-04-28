'use strict';

var ensureDbjsObject = require('dbjs/valid-dbjs-object')
  , ensureArray      = require('es5-ext/array/valid-array');

/**
 *
 * Filters existing property paths from a given dbjs object.
 * Can be used to sanitize input for eregistrations/utils/copy-by-paths
 *
 * @param obj   - the paths will be checked against this object
 * @param paths - dbjs property paths to check
 * options { object }
 * - isSource   - When some paths are objects, you have to set this option.
 *                When true, then the obj param is treated as source,
 *                otherwise it's treated as target
 *                See eregistrations/utils/copy-by-paths for more details
 * @returns {*}
 */

module.exports = function (obj, paths/*, options */) {
	var options = Object(arguments[2]);
	ensureDbjsObject(obj);
	ensureArray(paths);
	return paths.filter(function (path) {
		var resolved, resolvedPath = path;
		if (typeof path === 'object') {
			if (options.isSource == null) {
				throw new Error('When using path objects, you must setup isSource flag');
			}
			resolvedPath = options.isSource ? path.pathFrom : path.pathTo;
		}
		resolved = obj.resolveSKeyPath(resolvedPath);
		return resolved && resolved.object.hasPropertyDefined(resolved.key);
	});
};
