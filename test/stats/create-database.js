'use strict';

var Database = require('dbjs')
  , isDbjs = require('dbjs/is-dbjs');

module.exports = function (t, a) {
	a(isDbjs(t(new Database(), 'statsBase')), true, 'Is dbjs');
};
