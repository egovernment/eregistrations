'use strict';

var initDriver = require('../../../utils/init-driver');

module.exports = function (root, storageNames/*, dbDriverConf*/) {
	var driver = initDriver(root, storageNames, arguments[2]);
	driver.isReceiver = true;
	return driver;
};
