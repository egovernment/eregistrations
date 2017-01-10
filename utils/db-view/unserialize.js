// Unserialize view string into array of objects

'use strict';

var unserializeId = require('./unserialize-id');

module.exports = function (view, type) {
	if (!view) return [];
	return view.split('\n').map(function (data) {
		try {
			return unserializeId(data, type);
		} catch (e) {
			if (e.code !== 'MISSING_TARGET') throw e;
			// There can be a race condition when in first batch object remove records arrive and in
			// second updated view. In such case after first batch we may try to resolve view
			// that references removed object, hence MISSING_TARGET crash.
			// As views functionality is deprecated, we will silence such error in all cases, allowing
			// the app to naturally recover
		}
	}).filter(Boolean);
};
