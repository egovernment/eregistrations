'use strict';

var copy = require('es5-ext/object/copy');

module.exports = exports = copy(require('../../view/print-request-history'));
exports._parent = require('./print-base');
