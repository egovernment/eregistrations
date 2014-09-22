'use strict';

var serialize = require('dbjs/_setup/serialize/value');

module.exports = function (db, mongo/*, options */) {
	var options = Object(arguments[2]);

	db.objects.on('update', function (event) {
		var master = event.object.master, id, value;
		if (!db.Object.is(master)) return;
		if (options.ignored && options.ignored[master.constructor.__id__]) return;
		id = event.object.__valueId__;
		value = event.value;
		if (value === undefined) {
			console.log("MongoDB Delete", mongo.collectionName, id);
			mongo.delete(id).done();
			return;
		}
		value = serialize(value);
		console.log("MongoDB Update", mongo.collectionName, id, value);
		mongo.update(id, {
			_id: id,
			sourceId: event.sourceId,
			stamp: event.stamp,
			value: value
		}).done();
	});
};
