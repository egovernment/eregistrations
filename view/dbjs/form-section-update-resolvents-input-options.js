'use strict';

var db = require('../../db')
  , d  = require('d');

Object.defineProperties(db.FormSectionUpdate.prototype.getOwnDescriptor('resolvent'), {
	inputOptions: d({
		multiline: false
	})
});
