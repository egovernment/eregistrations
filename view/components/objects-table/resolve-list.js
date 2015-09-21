// Method that normalizes provided list (provided by server) against "full-data" objects (objects
// for which we have all data on client).
// It is to ensure that eventual local updates are visible instantly in server provided lists

'use strict';

var Set = require('es6-set')
  , unserializeView = require('../../../utils/db-view/unserialize-raw')

  , ceil = Math.ceil
  , byIndex = function (a, b) { return a.stamp - b.stamp; }
  , getItem = function (data) { return data.item; };

module.exports = function (data, query) {
	var applicable = new Set(), notApplicable = new Set()
	  , items = unserializeView(data.view, this._type);
	if (!items.length) return items;
	var entryIndex = (query.page === 1) ? -Infinity : items[0].index;
	var exitIndex = (ceil(data.size / this.itemsPerPage) === query.page)
		? Infinity : items[items.length - 1].index;
	this._fullItems.forEach(function (item) {
		if (this._isItemApplicable(item, query)) applicable.add(item);
		else notApplicable.add(item);
	}, this);
	items = items.filter(function (data) {
		if (notApplicable.has(data.item)) return false;
		if (!applicable.has(data.item)) return true;
		data.index = this._getItemOrderIndex(data.item);
		applicable.delete(data.item);
		return true;
	}, this);
	applicable.forEach(function (item) {
		var index = this._getItemOrderIndex(item);
		if (index < entryIndex) return;
		if (index > exitIndex) return;
		items.push({ item: item, index: index });
	}, this);
	return items.sort(byIndex).map(getItem);
};
