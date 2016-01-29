'use strict';

var mano = require('mano');

module.exports = function (emitterHandler) {
	var driver = emitterHandler.getDriver('local');
	mano.dbDriver = driver;
	return driver;
};
