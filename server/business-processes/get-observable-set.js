// Returns observable set of business process ids for given index name and value

'use strict';

var memoize       = require('memoizee')
  , resolveFilter = require('dbjs-persistence/lib/resolve-filter')
  , ObservableSet = require('observable-set/primitive')
  , dbDriver      = require('mano').dbDriver;

module.exports = memoize(function (indexName, value) {
	var set = new ObservableSet();
	dbDriver.on('computed:' + indexName, function (event) {
		if (resolveFilter(value, event.data.value)) set.add(event.ownerId);
		else set.delete(event.ownerId);
	});
	return dbDriver.searchComputed(indexName, function (ownerId, data) {
		if (resolveFilter(value, data.value)) set.add(ownerId);
	})(set);
}, { primitive: true });
