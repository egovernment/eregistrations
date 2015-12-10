'use strict';

var remove      = require('es5-ext/array/#/remove')
  , capitalize  = require('es5-ext/string/#/capitalize')
  , d           = require('d')
  , ee          = require('event-emitter')
  , deferred    = require('deferred')
  , memoize     = require('memoizee')
  , once        = require('timers-ext/once')
  , dbDriver    = require('mano').dbDriver
  , getIndexMap = require('./get-db-sort-index-map')

  , defineProperty = Object.defineProperty
  , compareStamps = function (a, b) { return a.stamp - b.stamp; };

module.exports = memoize(function (set, recordType, sortKeyPath) {
	var arr = ee([]), itemsMap = getIndexMap(recordType, sortKeyPath)
	  , count = 0, isInitialized = false, def = deferred(), setListener, itemsListener
	  , methodName = 'get' + capitalize.call(recordType);
	arr.emitChange = once(arr.emit.bind(arr, 'change'));
	var add = function (ownerId) {
		var promise;
		if (itemsMap[ownerId]) promise = deferred(itemsMap[ownerId]);
		else promise = dbDriver[methodName](ownerId + (sortKeyPath ? ('/' + sortKeyPath) : ''));
		return promise.aside(function (data) {
			if (!set.has(ownerId)) return;
			if (!itemsMap[ownerId]) itemsMap[ownerId] = { id: ownerId, stamp: data ? data.stamp : 0 };
			arr.push(itemsMap[ownerId]);
			if (def.resolved) {
				arr.sort(compareStamps);
				arr.emitChange();
			}
		});
	};
	set.on('change', setListener = function (event) {
		if (event.type === 'add') {
			add(event.value).done();
		} else {
			remove.call(arr, itemsMap[event.value]);
			arr.emitChange();
		}
	});
	itemsMap.on('update', itemsListener = function (event) {
		if (!set.has(event.ownerId)) return;
		if (def.resolved) {
			arr.sort(compareStamps);
			arr.emitChange();
		}
	});
	set.forEach(function (ownerId) {
		++count;
		add(ownerId).done(function () {
			if (!--count && isInitialized) def.resolve(arr.sort(compareStamps));
		});
	});
	isInitialized = true;
	if (!count) def.resolve(arr.sort(compareStamps));
	defineProperty(set, '_dispose', d(function () {
		set.off(setListener);
		itemsMap.off(itemsListener);
	}));
	return def.promise;
});
