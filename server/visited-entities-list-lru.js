'use strict';

var startsWith = require('es5-ext/string/#/starts-with')
  , dbDriver   = require('mano').dbDriver;

dbDriver.on('update', function (event) {
	if (startsWith.call(event.keyPath, 'visited'
});
