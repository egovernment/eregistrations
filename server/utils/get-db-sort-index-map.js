// Returns primitive { ownerId: sortIndexValue } map for provided sortKeyPath

'use strict';

var ensureString  = require('es5-ext/object/validate-stringifiable-value')
  , ee            = require('event-emitter')
  , memoize       = require('memoizee')
  , ensureStorage = require('dbjs-persistence/ensure-storage')

  , isArray = Array.isArray;

module.exports = memoize(function (storage, sortKeyPath) {
	var itemsMap = ee(), storages;
	if (isArray(storage)) storages = storage.map(ensureStorage);
	else storages = [ensureStorage(storage)];

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
}, { primitive: true, resolvers: [function (storageName) {
	if (isArray(storageName)) return storageName.map(ensureString).sort();
	return ensureString(storageName);
}, function (sortKeyPath) {
	return (sortKeyPath == null) ? '' : String(sortKeyPath);
}] });
