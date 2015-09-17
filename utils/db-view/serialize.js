'use strict';

module.exports = function (collection, getIndex) {
	var result = [];
	collection.forEach(function (bp) { result.push(getIndex(bp) + '.' + bp.__id__); });
	return result.join('\n');
};
