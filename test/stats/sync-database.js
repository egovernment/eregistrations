'use strict';

var reduceCreate = require('dbjs-reduce/create')
  , Database     = require('dbjs');

module.exports = function (t, a) {
	var testDb = new Database(), target;
	testDb.Object.extend('User', {
		propToSync: {
			type: testDb.Number,
			value: 1,
			statsBase: true
		},
		propNotToSync: {
			type: testDb.Number,
			value: 2
		}
	});
	target = reduceCreate(testDb, 'statsBase');
	new testDb.User().set('roles', 'user'); //jslint: ignore
	target = t(testDb, target);
	new testDb.User().set('roles', 'user'); //jslint: ignore
	a(target.User.instances.size, 2, "Object propagated");
	a(target.User.instances.first.propToSync, 1, "Stats Base property propagated");
	a(target.User.instances.first.propNotToSync, undefined, "Should not propagate");
};
