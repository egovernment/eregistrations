// Unserialize view string into array of objects

'use strict';

var stringify = JSON.stringify;

module.exports = function (data, type) {
	var id = data.split('.')[1] || data, path, obj, masterId;

	if (id.indexOf('/') !== -1) {
		path = id.slice(id.indexOf('/') + 1);
		masterId = id.slice(0, id.indexOf('/'));
		obj = type.getById(masterId);
		if (obj) {
			obj = obj.resolveSKeyPath(path).value;
		}
	} else {
		obj = type.getById(id);
	}

	if (!obj) {
		throw new Error("Not object found for " + stringify(id) +
			" (full data: " + stringify(data) + ") by type: " + stringify(type.__id__));
	}
	return obj;
};
