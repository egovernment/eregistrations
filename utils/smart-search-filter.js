// Produces search based on incremental reactive reusable lists

'use strict';

module.exports = function (list, searchFilter, value) {
	list = list.filter(searchFilter(value[0]));
	if (!value[1]) return list;
	list = list.filter(searchFilter(value.slice(0, 2)));
	if (!value[2]) return list;
	list = list.filter(searchFilter(value.slice(0, 3)));
	if (!value[3]) return list;
	return list.filter(searchFilter(value));
};
