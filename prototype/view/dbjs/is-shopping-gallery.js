'use strict';

var d  = require('d')
  , db = require('mano').db;

Object.defineProperties(db.User.prototype.getDescriptor('isShoppingGallery'), {
	inputOptions: d({
		type: 'checkbox'
	})
});
