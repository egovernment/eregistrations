'use strict';

var remove   = require('es5-ext/array/#/remove')
  , d        = require('d')
  , ee       = require('event-emitter')
  , once     = require('timers-ext/once')
  , deferred = require('deferred')
  , memoize  = require('memoizee/plain')
  , dbDriver = require('mano').dbDriver
  , getSet   = require('./get-observable-set')

  , create = Object.create, defineProperty = Object.defineProperty
  , compareStamps = function (a, b) { return a.stamp - b.stamp; };

module.exports = memoize(function () {
	return getSet()(function (set) {
		var arr = ee([]), itemsMap = create(null)
		  , count = 0, isInitialized = false, def = deferred(), setListener;
		arr.emitChange = once(arr.emit.bind(arr, 'change'));
		var add = function (ownerId) {
			return deferred(itemsMap[ownerId] || dbDriver.getDirect(ownerId))
				.aside(function (data) {
					if (!set.has(ownerId)) return;
					if (!itemsMap[ownerId]) itemsMap[ownerId] = { id: ownerId, stamp: data.stamp };
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
		set.forEach(function (ownerId) {
			++count;
			add(ownerId).done(function () {
				if (!--count && isInitialized) def.resolve(arr.sort(compareStamps));
			});
		});
		isInitialized = true;
		if (!count) def.resolve(arr.sort(compareStamps));
		defineProperty(set, '_dispose', d(function () { set.off(setListener); }));
		return def.promise;
	});
});
