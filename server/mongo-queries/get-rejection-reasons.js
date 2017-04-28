'use strict';

var mongo = require('../mongo-db');

module.exports = function (/* opts */) {
	return mongo.connect()(function (db) {
		return db.collection('rejectionReasons').find().toArray();
	});
};
