'use strict';

var mongoDB = require('../mongo-db');

exports.update = function (data) {
	return mongoDB.connect()(function (db) {
		var collection = db.collection('wsRequests');
		if (data._id) {
			return collection.update({ _id: data._id }, { $set: data });
		}
		return collection.insertOne(data);
	});
};

exports.getErrored = function () {
	return mongoDB.connect()(function (db) {
		var collection = db.collection('wsRequests');
		return collection.find({ $or: [ { status: null }, { status: 'error' } ] });
	});
};
