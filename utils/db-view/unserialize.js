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
			// In case of race condition there can be scenario when in first batch object remove
			// records arrive and in second updated view.
			// As views functionality is deprecated, we will silence such error, allowing
			// the app to naturally recover when view update comes in
		}
	}).filter(Boolean);
};
