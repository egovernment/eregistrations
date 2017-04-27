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
		return deferred.map(bpStorages, function (storage) {
			debug('searching storage...........', storage.name);
			return storage.searchComputed({
				keyPath: 'status',
				value: '3rejected'
			}, function (rejectedId) {
				var bpId = rejectedId.split('/')[0];
				debug('found rejected bp...........', bpId);
				return mano.queryMemoryDb([bpId], 'businessProcessRejectionReasons', {
					businessProcessId: bpId
				})(function (result) {
					return mongoDB()(function (db) {
						var collection = db.collection('rejectionReasons');
						return collection.find({ 'service.id': bpId }).count().then(function (count) {
							if (count) return;
							return collection.insertOne(result);
						});
					});
				});
			});
		});
	}).done();
});
