// Serialize database collection into view string representation

'use strict';

module.exports = function (collection) {
	var result = [];
	collection.forEach(function (data) { result.push(data.stamp + '.' + data.id); });
	return result.join('\n');
};
