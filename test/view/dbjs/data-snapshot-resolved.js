'use strict';

var Database = require('dbjs')
  , define   = require('../../../model/lib/data-snapshot');

module.exports = function (t, a) {
	var db = new Database(), snapshot;
	define(db);
	t(db);
	snapshot = new db.DataSnapshot();
	a(snapshot.jsonString, undefined);
	a(snapshot.resolved, null);
	a(snapshot._resolved.value, null);

	snapshot.jsonString = '{"foo":true}';
	a(snapshot.jsonString, '{"foo":true}');
	a.deep(snapshot.resolved, { foo: true });
	a.deep(snapshot._resolved.value, { foo: true });

	snapshot.jsonString = '{"elo":{"bar":234}}';
	a(snapshot.jsonString, '{"elo":{"bar":234}}');
	a.deep(snapshot.resolved, { elo: { bar: 234 } });
	a.deep(snapshot._resolved.value, { elo: { bar: 234 } });
};
