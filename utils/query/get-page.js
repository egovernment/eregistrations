// For data array returns subset corresponding to desired page

'use strict';

var ensureArray         = require('es5-ext/array/valid-array')
  , ensureNumber        = require('es5-ext/object/ensure-natural-number-value')
  , itemsPerPage        = require('mano').env.objectsListItemsPerPage
  , defaultItemsPerPage = require('../../conf/objects-list-items-per-page');

if (!itemsPerPage) itemsPerPage = defaultItemsPerPage;

module.exports = function (data, pageNumber) {
	var offset;
	ensureArray(data);
	pageNumber = ensureNumber(pageNumber);
	if (!pageNumber) throw new TypeError("Page number should be greater than 0");
	if (Math.ceil(data.length / itemsPerPage) < pageNumber) {
		return [];
	}
	offset = itemsPerPage * (pageNumber - 1);
	return data.slice(offset, offset + itemsPerPage);
};
