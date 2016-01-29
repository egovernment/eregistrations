'use strict';

var resolve = require('path').resolve
  , Driver  = require('dbjs-persistence')
  , mano    = require('mano');

module.exports = function (root) {
	var driver = new Driver({ path: resolve(root, 'data-global'), name: 'global' });

	mano.dbDriverGlobal = driver;
	driver.isReceiver = true;
	return driver;
};
