'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db   = new Database()
	  , Type = db.Object.extend('Type');

	a.throws(function () { t(); }, new RegExp('undefined is not dbjs object'));

	var object = new Type();

	t(object);

	a(Type.hasPropertyDefined('getTranslations'), false);
	a(object.hasOwnPropertyDefined('getTranslations'), true);
};
