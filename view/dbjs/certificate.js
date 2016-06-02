'use strict';

var d  = require('d')
  , db = require('mano').db;

Object.defineProperties(db.Document.prototype.getDescriptor('issueDate'), {
	inputOptions: d({
		value: new Date()
	})
});
