'use strict';

exports.route = function (req) { return true; };
exports.order = 1;

var env = require('mano').env;
exports.forceLegacy = !env || !env.dev;
exports.forceLegacyFullRender = true;
exports.viewPath = './view';
