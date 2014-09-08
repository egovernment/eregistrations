'use strict';

var source   = require('../__playground/stats/create-database')
  , createDb   = require('../../stats/create-database');

module.exports = function (t, a) {
	var target = t(source, createDb(source)),
		testUser, targetUser, testUser2;

	testUser = new source.User();
	testUser.nestedBridgeStats.bridgeRegularValue = 1;
	targetUser = target.User.instances.first;
	a(target.User.instances.size, 1, "User Added");
	a(targetUser.nestedBridgeStats.bridgeRegularValue, 1, "Value Nested");
	testUser.statsRegularComputedStatsValue = 'stringValue';
	a(targetUser.statsRegularComputedStatsValue, 'stringValue', "Value");
	testUser.regularValue = 'bar';
	a(targetUser.regularValue, undefined, "Not Stats Base Value");
	testUser.statsMultiple.add(1);
	testUser.statsMultiple.add(2);
	testUser.statsMultiple.add(3);
	a(targetUser.statsMultiple.last, 3, "Multiple Add");
	testUser.statsMultiple.delete(1);
	a(targetUser.statsMultiple.first, 2, "Multiple Delete");
	source._postponed_ += 1;
	testUser.statsMultiple.delete(2);
	testUser.statsMultiple.delete(3);
	source._postponed_ -= 1;
	a(targetUser.statsMultiple.size, 0, "Multiple Batch");
	source.objects.delete(testUser);
	a(target.User.instances.size, 0, "User Deleted");
	source._postponed_ += 1;
	testUser  = new source.User();
	testUser2 = new source.User();
	source._postponed_ -= 1;
	a(target.User.instances.size, 2, "User Added Batch");
	source._postponed_ += 1;
	source.objects.delete(testUser);
	source.objects.delete(testUser2);
	source._postponed_ -= 1;
	a(target.User.instances.size, 0, "User Deleted Batch");
};
