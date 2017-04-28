'use strict';

var MongoClient = require('mongodb').MongoClient
  , promisify   = require('deferred').promisify
  , connectMongo;

connectMongo = promisify(MongoClient.connect);

exports.connect = function () {
	var env = require('mano').env;

	if (!env.mongo || !env.mongo.url || !env.mongo.dbName) {
		throw new Error('No configuration for mongo db found in env, cannot connect');
	}

	return connectMongo(env.mongo.url + env.mongo.dbName);
};
