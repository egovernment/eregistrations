'use strict';

var mongoDB = require('../server/mongo-db');

exports.update = function (query, data) {
	return mongoDB.connect()(function (db) {
		var collection = db.collection('wsRequests');
		return collection.update(query, { $set: data },
			{ upsert: true });
	});
};

exports.insertOne = function (data) {
	return mongoDB.connect()(function (db) {
		var collection = db.collection('wsRequests');
		return collection.insertOne(data);
	});
};

exports.findOne = function (query) {
	return mongoDB.connect()(function (db) {
		var collection = db.collection('wsRequests');
		return collection.findOne(query);
	});
};

exports.getErrored = function () {
	return mongoDB.connect()(function (db) {
		var collection = db.collection('wsRequests');
		return collection.find({ $or: [ { status: null }, { status: 'error' } ] }).toArray();
	});
};

exports.getUnfinished = function () {
	return mongoDB.connect()(function (db) {
		var collection = db.collection('wsRequests');
		return collection.find({ $and: [ { status: 'started' }, { finishedAt: null } ] }).toArray();
	});
};
