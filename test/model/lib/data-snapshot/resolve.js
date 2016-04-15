'use strict';

var Database = require('dbjs')
  , define   = require('../../../../model/lib/data-snapshot');

module.exports = function (t, a) {
	var db = new Database(), snapshot;
	define(db);
	t(db);
	snapshot = new db.DataSnapshot();
	a(snapshot.json, undefined);
	a.deep(snapshot.resolved, {});
	a.deep(snapshot._resolved.value, {});

	snapshot.json = '{"foo":true}';
	a(snapshot.json, '{"foo":true}');
	a.deep(snapshot.resolved, { foo: true });
	a.deep(snapshot._resolved.value, { foo: true });

	snapshot.json = '{"elo":{"bar":234}}';
	a(snapshot.json, '{"elo":{"bar":234}}');
	a.deep(snapshot.resolved, { elo: { bar: 234 } });
	a.deep(snapshot._resolved.value, { elo: { bar: 234 } });
};
