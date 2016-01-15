'use strict';

var startsWith = require('es5-ext/string/#/starts-with')
  , forEach    = require('es5-ext/object/for-each')
  , driver     = require('mano').dbDriver;

module.exports = driver.storages(function (storages) {
	var result = [];
	forEach(storages, function (storage, name) {
		if (startsWith.call(name, 'businessProcess')) result.push(storage);
	});
	return result;
});
