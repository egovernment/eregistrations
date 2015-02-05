'use strict';

var d = require('d'),
	db = require('mano').db;

Object.defineProperty(
	db.User.prototype.getDescriptor('lomasActivity'),
	'inputOptions',
	d({ minInputsCount: 1 })
);
