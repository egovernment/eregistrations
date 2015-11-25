'use strict';

var ee       = require('event-emitter')
  , memoize  = require('memoizee')
  , dbDriver = require('mano').dbDriver;

module.exports = memoize(function (sortIndexName) {
	var itemsMap = ee();
	dbDriver.on('computed:' + sortIndexName, function (event) {
		if (!itemsMap[event.ownerId]) return;
		itemsMap[event.ownerId].stamp = event.data.stamp;
		itemsMap.emit('update', event);
	});
	return itemsMap;
}, { primitive: true });
