'use strict';

var promisify  = require('deferred').promisify
  , bcrypt     = require('bcrypt')
  , program    = require('commander')

  , genSalt = promisify(bcrypt.genSalt), hash = promisify(bcrypt.hash)
  , promptEmail, promptPassword;

module.exports = function (dbServer) {
	var database = dbServer.database;
	promptEmail = function () {
		program.prompt('UsersAdmin email: ', function (value) {
			value = value.trim();
			try { database.Email.validate(value); } catch (error) {
				console.log(error.message);
				promptEmail();
				return;
			}
			promptPassword(value);
		});
	};

	promptPassword = function (email) {
		program.prompt(email + ' password: ', function (value) {
			value = value.trim();
			try { database.Password.validate(value); } catch (error) {
				console.log(error.message);
				promptPassword(email);
				return;
			}
			hash(value, genSalt())(function (password) {
				return database.User({ email: email, password: password,
					firstName: "Users", lastName: "Admin",
					roles: ['usersAdmin'] });
			}).done(function () {
				dbServer.close().done(function () {
					console.log("Usersadmin user succesfully created. To be able to" +
						" login with usersadmin, server needs to be restarted");
				});
			});
		});
	};

	console.log("!!! Make sure application server is down, before you proceed !!!");
	console.log("Reasoning: Adding Users Admin account using this script will not automatically");
	console.log("add Users Admin to running application process. Application process needs to be");
	console.log("restarted afterwars, then it'll be loaded into database memory");

	dbServer.loadAll().done(function () {
		promptEmail();
	});
};
