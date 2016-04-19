// Observable set proxy needed to get out of primitive observable set mode,
// which can't work if want to map set into values that are not serializable same way
// This unfortunate hack is needed until following serializer is in use:
// https://github.com/medikoo/dbjs/blob/master/_setup/serialize/object.js

'use strict';

var ObservableSet       = require('observable-set')
  , ensureObservableSet = require('observable-set/valid-observable-set');

module.exports = function (primitiveSet) {
	ensureObservableSet(primitiveSet);
	var set = new ObservableSet();
	set.reload(primitiveSet);
	primitiveSet.on('change', set.reload.bind(set, primitiveSet));
	return set;
};
