'use strict';

var mongo = require('../mongo-db');

exports.find = function (/* opts */) {
	var queryCriteria = Object(arguments[0])
	  , portion = Object(arguments[1]);

	return mongo.connect()(function (db) {
		return db.collection('rejectionReasons')
			.find(queryCriteria)
			.skip(portion.offset).limit(portion.limit).toArray();
	});
};

exports.count = function (/* opts */) {
	var queryCriteria = Object(arguments[0]);
	return mongo.connect()(function (db) {
		return db.collection('rejectionReasons').find(queryCriteria).count();
	});
};
