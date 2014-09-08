'use strict';

var validDbjs    = require('dbjs/valid-dbjs')
  , DbjsEvent    = require('dbjs/_setup/event')
  , serializeKey = require('dbjs/_setup/serialize/key')
  , sync, setupObservableListener, statsDb, setupSetListener
  , listener, setupListeners = {}, setupListenerHandler, removeListeners
  , mainDb, setUserListener, setListstener;

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
		if (!desc.nested && (!desc.key || desc.statsBase === undefined)) {
			continue;
		}
		if (desc.hasOwnProperty('statsBase') && desc.master !== mainDb.User.prototype) {
			continue;
		}
		if (desc.nested) {
			sync(sourceInstance.get(desc.key));
			continue;
		}
		if (desc.multiple) {
			setupSetListener(sourceInstance, desc.key);
			continue;
		}
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
	var handler = sourceInstance[key].on('change', setListstener);
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

setListstener = function (ev) {
	var value, collection, sourceEvent = ev.dbjs;
	if (ev.type === 'batch') {
		if (ev.added) {
			value = true;
			collection = ev.added;
		} else {
			collection = ev.deleted;
		}
		collection.forEach(function (event) {
			new DbjsEvent(statsDb.objects.unserialize(this.dbId + '*' + serializeKey(event)), value,
					(sourceEvent && sourceEvent.stamp) || 0); //jslint: ignore
		}.bind(this));
		return;
	}
	if (ev.type === 'add') value = true;
	new DbjsEvent(statsDb.objects.unserialize(this.dbId + '*' + serializeKey(ev.value)), value,
			(sourceEvent && sourceEvent.stamp) || 0); //jslint: ignore
};

setUserListener = function (ev) {
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

module.exports = function (mainDataBase, targetDb) {
	validDbjs(mainDataBase);
	validDbjs(targetDb);
	statsDb = targetDb;
	mainDb  = mainDataBase;
	mainDb.User.instances.forEach(function (user) {
		sync(user);
	});
	mainDb.User.instances.on('change', setUserListener);

	return statsDb;
};
