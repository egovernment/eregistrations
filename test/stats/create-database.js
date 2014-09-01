'use strict';

var exampleModel = require('./__playground/example-model');

module.exports = function (t, a) {
	var res = t(exampleModel);
	console.log(res);
};
