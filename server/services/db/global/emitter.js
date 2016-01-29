'use strict';

var mano = require('mano');

module.exports = function (emitterHandler) {
	var driver = emitterHandler.getDriver('global');
	mano.dbDriverGlobal = driver;
	return driver;
};
