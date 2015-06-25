// 404 Page not found configuration

'use strict';

exports._parent = require('./base');

exports.body = function () {
	h1("404");
};
