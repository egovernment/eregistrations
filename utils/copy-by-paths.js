'use strict';

var ensureDbjsObject = require('dbjs/valid-dbjs-object')
  , ensureArray      = require('es5-ext/array/valid-array');

/**
 * Copies property values from one dbjs object to other
 * @param from  {Object}
 * @param to    {Object}
 * @param paths {Array}  - each item is either a path
 *                         or an object of the form { pathFrom: 'some/path', pathTo: 'other/path' }
 */

module.exports = function (from, to, paths/* */) {
	var opts = Object(arguments[3]), suppressErrors;
	suppressErrors = opts && opts.suppressErrors;
	ensureDbjsObject(from);
	ensureDbjsObject(to);
	ensureArray(paths);
	paths.forEach(function (path) {
		var pathFrom = path, pathTo = path, resolvedFrom, resolvedTo;

		if (typeof path === 'object') {
			pathFrom = path.pathFrom;
			pathTo   = path.pathTo;
		}
		resolvedFrom = from.resolveSKeyPath(pathFrom);
		if (!resolvedFrom || !resolvedFrom.object.hasPropertyDefined(resolvedFrom.key)) {
			if (suppressErrors) return;
			throw new Error('Could not resolve path: ' + pathFrom + ', on object: ' + from.__id__);
		}
		resolvedTo = to.resolveSKeyPath(pathTo);
		if (!resolvedTo || !resolvedTo.object.hasPropertyDefined(resolvedTo.key)) {
			if (suppressErrors) return;
			throw new Error('Could not resolve path: ' + pathTo + ', on object: ' + to.__id__);
		}
		if (resolvedFrom.value === resolvedTo.value) {
			return;
		}
		if (resolvedFrom.value === undefined) {
			resolvedTo.object.delete(resolvedTo.key);
			return;
		}
		if (resolvedFrom.value === null && resolvedTo.descriptor.required) {
			return;
		}
		if (resolvedFrom.descriptor.multiple && !resolvedFrom.value.size) {
			return;
		}
		if (suppressErrors) {
			try {
				resolvedTo.object.set(resolvedTo.key, resolvedFrom.value);
			} catch (ignore) {}
		} else {
			resolvedTo.object.set(resolvedTo.key, resolvedFrom.value);
		}
	});
};
