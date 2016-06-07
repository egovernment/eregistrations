'use strict';

var aFrom               = require('es5-ext/array/from')
  , ensureObject        = require('es5-ext/object/valid-object')
  , ensureString        = require('es5-ext/object/validate-stringifiable-value')
  , Map                 = require('es6-map')
  , Set                 = require('es6-set')
  , deferred            = require('deferred')
  , ensureObservableSet = require('observable-set/valid-observable-set')
  , ensureObservableMap = require('observable-map/valid-observable-map')
  , serializeValue      = require('dbjs/_setup/serialize/value')
  , observeSet          = require('../../utils/observe-set')
  , observeMap          = require('../../utils/observe-map')
  , idToStorage         = require('./any-id-to-storage');

module.exports = function (keyPath, targetItems, ownerMap) {
	keyPath = ensureString(keyPath);
	(ensureObject(targetItems) && ensureObject(ownerMap));

	return deferred(targetItems, ownerMap).spread(function (targetItems, ownerMap) {
		var cache = new Map(), isReverseMap = ensureObservableMap(ownerMap).isReverseMap
		  , isInitialized = false;

		var update = function (ownerId, set) {
			return idToStorage(ownerId)(function (storage) {
				if (!storage) throw new Error("Could not resolve storage for " + ownerId);
				return storage.storeComputed(ownerId + '/' + keyPath, serializeValue(set.size));
			});
		};

		var onAdd = function (ownerId, targetId) {
			var set;
			if (!cache.has(ownerId)) cache.set(ownerId, new Set());
			set = cache.get(ownerId).add(targetId);
			if (isInitialized) update(ownerId, set);
		};
		var onDelete = function (ownerId, targetId) {
			var set = cache.get(ownerId);
			if (!set || !set.has(targetId)) return;
			set.delete(targetId);
			update(ownerId, set);
		};
		observeSet(ensureObservableSet(targetItems), {
			iterateExisting: true,
			onAdd: function (targetId) {
				var ownerId = ownerMap.get((isReverseMap ? '7' : '') + targetId);
				if (!ownerId) return;
				if (!isReverseMap) ownerId = ownerId.slice(1);
				onAdd(ownerId, targetId);
			},
			onDelete: function (targetId) {
				var ownerId = ownerMap.get((isReverseMap ? '7' : '') + targetId);
				if (!ownerId) return;
				if (!isReverseMap) ownerId = ownerId.slice(1);
				onDelete(ownerId, targetId);
			}
		});
		observeMap(ownerMap, {
			onSet: function (targetId, ownerId) {
				if (isReverseMap) targetId = targetId.slice(1);
				else ownerId = ownerId.slice(1);
				if (!targetItems.has(targetId)) return;
				onAdd(ownerId, targetId);
			},
			onDelete: function (targetId, ownerId) {
				if (isReverseMap) targetId = targetId.slice(1);
				else ownerId = ownerId.slice(1);
				if (!targetItems.has(targetId)) return;
				onDelete(ownerId, targetId);
			}
		});
		isInitialized = true;
		return deferred.map(aFrom(cache), function (data) { return update(data[0], data[1]); });
	});
};
