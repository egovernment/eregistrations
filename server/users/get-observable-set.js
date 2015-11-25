'use strict';

var memoize             = require('memoizee/plain')
  , ObservableSet       = require('observable-set/primitive')
  , dbDriver            = require('mano').dbDriver;

module.exports = memoize(function () {
	var set = new ObservableSet();
	dbDriver.on('computed:isActiveAccount', function (event) {
		if (event.data.value === '11') set.add(event.ownerId);
		else set.delete(event.ownerId);
	});
	return dbDriver.searchComputed('isActiveAccount', function (ownerId, data) {
		if (data.value === '11') set.add(ownerId);
	})(set);
});
