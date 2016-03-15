'use strict';

var d = require('d'),
	db = require('mano').db;

Object.defineProperty(
	db.User.prototype.getDescriptor('registerIds'),
	'inputOptions',
	d({ minInputsCount: 1 })
);
