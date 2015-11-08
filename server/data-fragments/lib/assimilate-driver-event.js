'use strict';

var isArray = Array.isArray;

module.exports = function (fragment, objId, keyPath, data) {
	if (!isArray(data.value)) {
		fragment.update(objId + '/' + keyPath, data);
		return;
	}
	data.value.forEach(function (data) {
		var key = data.key ? '*' + data.key : '';
		fragment.update(objId + '/' + keyPath + key, data);
	});
};
