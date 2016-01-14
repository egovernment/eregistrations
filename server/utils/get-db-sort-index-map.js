// Returns primitive { ownerId: sortIndexValue } map for provided sortKeyPath

'use strict';

var ensureString = require('es5-ext/object/validate-stringifiable-value')
  , ee           = require('event-emitter')
  , memoize      = require('memoizee')
  , dbDriver     = require('mano').dbDriver;

module.exports = memoize(function (storageName, sortKeyPath) {
	var itemsMap = ee();
	dbDriver.getStorage(storageName).on('key:' + (sortKeyPath + '&'), function (event) {
		if (!itemsMap[event.ownerId]) {
			itemsMap[event.ownerId] = { id: event.ownerId, stamp: event.data.stamp };
		} else {
			itemsMap[event.ownerId].stamp = event.data.stamp;
		}
		itemsMap.emit('update', event);
	});
	return itemsMap;
}, { primitive: true, resolvers: [ensureString, function (sortKeyPath) {
	return (sortKeyPath == null) ? '' : String(sortKeyPath);
}] });
