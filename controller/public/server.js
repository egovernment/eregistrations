'use strict';

var db             = require('mano').db
  , registerSubmit = require('mano-auth/controller/server/register-and-login').submit
  , login          = require('mano-auth/server/authentication').login

  , maxage = 1000 * 60 * 60 * 24 * 7;

exports.login = require('mano-auth/controller/server/login');
exports.register = require('mano-auth/controller/server/register-and-login');
exports['reset-password'] = require('mano-auth/controller/server/reset-password');
exports['request-reset-password'] = require('mano-auth/controller/server/request-reset-password');

exports.register.submit = function (normalizedData, data) {
	normalizedData['User#/roles'] = ['user'];
	return registerSubmit.apply(this, arguments);
};

exports['init-demo'] = {
	validate: Function.prototype,
	submit: function () {
		var cookieName = 'demoUser'
		  , userId     = this.res.cookies.get(cookieName)
		  , demoUser;

		if (userId) {
			demoUser = db.User.getById(userId);
		}

		if (!demoUser || !demoUser.isDemo) {
			demoUser = new db.User();
			demoUser.roles.add('user');
			demoUser.isDemo = true;
		}

		this.res.cookies.set(cookieName, demoUser.__id__, { maxage: maxage });
		login(demoUser.__id__, this.req, this.res);
		this.user = demoUser;
	},
	redirectUrl: '/'
};
