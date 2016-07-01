// Configures statistics indexes for users and all existing business process services

'use strict';

var ensureObject              = require('es5-ext/object/valid-object')
  , uncapitalize              = require('es5-ext/string/#/uncapitalize')
  , ensureDatabase            = require('dbjs/valid-dbjs')
  , ensureDriver              = require('dbjs-persistence/ensure-driver')
  , userStatistics            = require('./user')
  , businessProcessStatistics = require('./business-process')
  , certificateStatistics     = require('./certificate');

module.exports = function (db, driver, processingStepsMap) {
	ensureDatabase(db);
	ensureDriver(driver);
	ensureObject(processingStepsMap);

	userStatistics(db, { storage: driver.getStorage('user') });

	db.BusinessProcess.extensions.forEach(function (type) {
		var storage = driver.getStorage(uncapitalize.call(type.__id__));
		businessProcessStatistics(type, {
			storage: storage,
			processingStepsMap: processingStepsMap
		});
		certificateStatistics(type, { storage: storage });
	});
};
