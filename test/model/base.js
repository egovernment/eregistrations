'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database();

	t(db);

	db.Object.prototype.define('foo', {
		type: db.Boolean,
		label: 'Foo',
		value: 'Boo'
	});
	a.deep(db.Object.prototype.getOwnDescriptor('foo').fieldToJSON(), {
		label: 'Foo',
		value: 'True'
	});
	a(db.Object.prototype.isEmpty(), false);
	a(db.Object.isValueEmpty({}), false);
	a(db.Object.isValueEmpty(), true);
	a(db.Object.isValueEmpty(null), true);
	a(db.Object.isValueEmpty(false), false);
};
