'use strict';

var isArray = Array.isArray;

module.exports = function (fragment, id, data) {
	if (!isArray(data.value)) {
		fragment.update(id, data);
		return;
	}
	data.value.forEach(function (data) {
		var key = data.key ? '*' + data.key : '';
		fragment.update(id + key, data);
	});
};
