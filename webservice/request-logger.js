'use strict';

var mongoDB = require('../server/mongo-db');

exports.findOneAndUpdate = function (query, data) {
	return mongoDB.connect()(function (db) {
		var collection = db.collection('wsRequests');
		return collection.findOneAndUpdate(query, { $set: data },
			{ upsert: true, returnNewDocument: true });
	});
};

exports.insertOne = function (data) {
	return mongoDB.connect()(function (db) {
		var collection = db.collection('wsRequests');
		return collection.insertOne(data);
	});
};

exports.getErrored = function () {
	return mongoDB.connect()(function (db) {
		var collection = db.collection('wsRequests');
		return collection.find({ $or: [ { status: null }, { status: 'error' } ] });
	});
};
