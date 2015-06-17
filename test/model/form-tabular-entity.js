'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , FormTabularEntity = t(db)
	  , entity = new FormTabularEntity({ propertyName: 'test' });

	a(entity.propertyName, 'test');
};
