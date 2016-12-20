'use strict';

var idToStorage      = require('./any-id-to-storage')
  , unserializeValue = require('dbjs/_setup/unserialize/value')
  , memoize          = require('memoizee');

module.exports = memoize(function (id) {
	return idToStorage(id)(function (storage) {
		return storage.getComputed(id + '/fullName')(function (data) {
			if (!data || data.value[0] !== '3') return;
			return unserializeValue(data.value);
		});
	});
});
