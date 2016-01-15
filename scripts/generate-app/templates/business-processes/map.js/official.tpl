// Extends business processes states meta data with object collections

'use strict';

var forEach = require('es5-ext/object/for-each')
  , all     = require('./')
  , meta    = require('./meta');

module.exports = meta;

forEach(meta, function (conf, name) {
	if (name === 'all') {
		conf.data = all;
	} else {
		conf.data = all.filterByKeyPath(conf.indexName, name);
	}
});
