// Returns primitive { ownerId: sortIndexValue } map for provided sortKeyPath

'use strict';

var ee            = require('event-emitter')
  , memoize       = require('memoizee')
  , ensureStorage = require('dbjs-persistence/ensure-storage')

  , isArray = Array.isArray;

module.exports = memoize(function (storage, sortKeyPath) {
	var itemsMap = ee(), storages;
	if (isArray(storage)) storages = storage;
	else storages = [storage];

	storages.forEach(function (storage) {
		storage.on('key:' + (sortKeyPath + '&'), function (event) {
			if (!itemsMap[event.ownerId]) {
				itemsMap[event.ownerId] = { id: event.ownerId, stamp: event.data.stamp };
			} else {
				itemsMap[event.ownerId].stamp = event.data.stamp;
			}
			itemsMap.emit('update', event);
		});
	});
	return itemsMap;
}, { primitive: true, resolvers: [function (storage) {
	if (isArray(storage)) return storage.map(ensureStorage).sort();
	return ensureStorage(storage);
}, function (sortKeyPath) {
	return (sortKeyPath == null) ? '' : String(sortKeyPath);
}] });
