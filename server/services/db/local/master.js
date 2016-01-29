'use strict';

var resolve = require('path').resolve
  , Driver  = require('dbjs-persistence')
  , mano    = require('mano');

module.exports = function (root/*, dbDriverConf*/) {
	var dbDriverConf = arguments[1], driver;
	if (dbDriverConf && dbDriverConf.driver) driver = new dbDriverConf.driver(dbDriverConf);
	else driver = new Driver({ path: resolve(root, 'data-local') });
	driver.name = 'local';
	mano.dbDriver = driver;
	driver.isReceiver = true;
	return driver;
};
