'use strict';

var DbjsEvent         = require('dbjs/_setup/event')
  , path              = require('path')
  , debug             = require('debug-ext')('start-service')
  , mano              = require('mano')
  , env               = require('../../../env')
  , startsWith        = require('es5-ext/string/#/starts-with')
  , deferred          = require('deferred')
  , mongoDB           = require('../server/mongo-db')

  , resolve = path.resolve
  , root = resolve(__dirname, '../../..')
  , dbService;

env.root = root;

dbService = require('../../../server/services/db');

DbjsEvent.stampZeroMode = true;
require('../../../server/model');
DbjsEvent.stampZeroMode = false;

debug('db persistence');
dbService().done(function () {
	var driver = mano.dbDriver;
	debug('processing steps meta');
	require('../../../processing-steps-meta');
	driver.getStorages()(function (storages) {
		var bpStorages = [];
		Object.keys(storages).forEach(function (storageName) {
			if (startsWith.call(storageName, 'businessProcess')) {
				bpStorages.push(storages[storageName]);
			}
		});

		return mongoDB.connect().then(function (db) {
			var collection = db.collection('processingStepsHistory');
			var migrationIndex = db.collection('processingStepsHistoryMigrationIndex');
			return deferred.map(bpStorages, function (storage) {
				debug('searching storage...........', storage.name);
				return storage.getAllObjectIds().then(function (ids) {
					return deferred.map(ids, deferred.gate(function (id) {
						var bpId = id;
						return migrationIndex.find({ _id: bpId }).count().then(function (migratedAlready) {
							if (migratedAlready) return deferred(null);
							debug('LOAD BP TO MEMORY %s', bpId);
							return mano.queryMemoryDb([bpId], 'processingStepStatusHistoryEntry', {
								businessProcessId: bpId
							});
						}).then(function (result) {
							migrationIndex.insertOne({ _id: bpId });
							if (!result || !result.length) return deferred(null);
							debug('GOT result %s', JSON.stringify(result));
							return collection.insert(result);
						}).then(null, function (err) {
							console.error(err);
						});
					}, 100));
				});
			});
		});
	}).done(function () {
		console.log('HURRAY, migration ended successfully!');
		process.exit();
	}, function (err) {
		console.error(err);
		process.exit();
	});
});
