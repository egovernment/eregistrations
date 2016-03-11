'use strict';

var d = require('d'),
	db = require('mano').db;

Object.defineProperty(
	db.User.prototype.getDescriptor('isValidated'),
	'DOMInput',
	d(require('../../../view/dbjs/_boolean-inline-button-group'))
);
