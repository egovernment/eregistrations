'use strict';

var MongoClient = require('mongodb').MongoClient
  , env         = require('./env')
  , promisify   = require('deferred').promisify
  , connectMongo;

connectMongo = promisify(MongoClient.connect);

if (!env.mongo || !env.mongo.url || !env.mongo.dbName) {
	throw new Error('No configuration for mongo db found in env, cannot connect');
}

module.exports = connectMongo(env.mongo.url + env.mongo.dbName);
