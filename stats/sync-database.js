'use strict';

var validDbjs = require('dbjs/valid-dbjs')
  , DbjsEvent = require('dbjs/_setup/event')
  , sync, setupObservableListener, statsDb, setupSetListener
  , listener, setupListeners = {}, setupListenerHandler, removeListeners;

sync = function (sourceInstance, deletion) {
	var desc, sourceEvent, proto;
	if ((statsDb.User.__id__ === sourceInstance.constructor.__id__ &&
			!statsDb.User.getById(sourceInstance.__id__))
			|| deletion) {
		if (deletion) {
			proto = statsDb.Base.prototype;
		} else {
			proto = statsDb.User.prototype;
		}
		sourceEvent = sourceInstance._lastOwnEvent_;
		new DbjsEvent(statsDb.objects.unserialize(sourceInstance.__id__,
				proto), proto,
				(sourceEvent && sourceEvent.stamp) || 0); //jslint: ignore
	}
	for (desc in sourceInstance.__descriptors__) {
		desc = sourceInstance.__descriptors__[desc];
		if (!desc.nested && (!desc.key || desc.statsBase === undefined || !desc._value_)) {
			continue;
		}
		if (desc.nested) {
			sync(desc);
			continue;
		}
		if (desc.multiple) {
			setupSetListener(sourceInstance, desc.key);
			continue;
		}
//		console.log(desc.key, desc, desc._value_);
		if (desc._value_ !== statsDb.objects.unserialize(desc.__valueId__)) {
			sourceEvent = desc._lastOwnEvent_;
			new DbjsEvent(statsDb.objects.unserialize(desc.__valueId__),
				desc._value_,
					(sourceEvent && sourceEvent.stamp) || 0); //jslint: ignore
		}
		setupObservableListener(sourceInstance, desc.key);
	}
};

setupSetListener = function (sourceInstance, key) {
	var handler = sourceInstance[key].on('change', listener);
	setupListenerHandler(sourceInstance.__id__, handler);
};

setupObservableListener = function (sourceInstance, key) {
	var handler = sourceInstance.getObservable(key).on('change', listener);
	setupListenerHandler(sourceInstance.__id__, handler);
};

listener = function (ev) {
	new DbjsEvent(statsDb.objects.unserialize(this.dbId), ev.newValue,
			(ev.dbjs && ev.dbjs.stamp) || 0); //jslint: ignore
};

setupListenerHandler = function (idKey, handler) {
	if (setupListeners[idKey]) {
		setupListeners[idKey].push(handler);
	} else {
		setupListeners[idKey] = [handler];
	}
};

removeListeners = function (idKey) {
	if (!setupListeners[idKey]) {
		return;
	}
	setupListeners[idKey].forEach(function (evList) {
		evList.off('change', listener);
	});
};

module.exports = function (mainDb, targetDb) {
	validDbjs(mainDb);
	validDbjs(targetDb);
	statsDb = targetDb;
	mainDb.User.instances.forEach(function (user) {
		sync(user);
	});
	mainDb.User.instances.on('change', function (ev) {
		if (ev.type === 'add') {
			sync(ev.value);
			return;
		}
		if (ev.type === 'delete') {
			removeListeners(ev.value.__id__);
			sync(ev.value, true);
			return;
		}
		if (ev.type === 'batch') {
			if (ev.added) {
				ev.added.forEach(function (event) {
					sync(event);
				});
				return;
			}
			if (ev.deleted) {
				ev.deleted.forEach(function (event) {
					removeListeners(event.__id__);
					sync(event, true);
				});
				return;
			}
		}
		console.log("Errorneous event:", ev);
		throw new Error("Unsupported event: " + ev.type);
	});

	return statsDb;
};
