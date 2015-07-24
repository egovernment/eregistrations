'use strict';

var Database = require('dbjs')
  , definePerson = require('../../../model/person');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = t(db)
	  , Person = definePerson(db)
	  , User
	  , user

	  , businessProcess = new BusinessProcess();

	a(businessProcess.representative.firstName, null);
	a(businessProcess.representative.lastName, null);
	User = Person.extend('TestUser', {
		type: Person,
		businessProcess: {
			type: BusinessProcess,
			reverse: 'user',
			unique: true
		}
	});
	user = new User();
	user.businessProcess = businessProcess;
	user.firstName = "Test";
	user.lastName = "Testowski";
	a(businessProcess.representative.firstName, "Test");
	a(businessProcess.representative.lastName, "Testowski");
	user.firstName = "Tester";
	a(businessProcess.representative.firstName, "Tester");
};
