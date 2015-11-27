'use strict';

var ee       = require('event-emitter')
  , memoize  = require('memoizee')
  , dbDriver = require('mano').dbDriver;

module.exports = memoize(function (recordType, sortKeyPath) {
	var itemsMap = ee();
	dbDriver.on(recordType + ':' + (sortKeyPath + '&'), function (event) {
		if (!itemsMap[event.ownerId]) return;
		itemsMap[event.ownerId].stamp = event.data.stamp;
		itemsMap.emit('update', event);
	});
	return itemsMap;
}, { primitive: true, resolvers: [String, function (sortKeyPath) {
	return (sortKeyPath == null) ? '' : String(sortKeyPath);
}] });
