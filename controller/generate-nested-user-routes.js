'use strict';

var assign        = require('es5-ext/object/assign')
  , callable      = require('es5-ext/object/valid-callable')
  , object        = require('es5-ext/object/valid-object')
  , stringifiable = require('es5-ext/object/validate-stringifiable-value')
  , nest          = require('mano/utils/nest-post-controllers')
  , db            = require('mano').db

  , keys = Object.keys;

var matchUser = function (id) {
	var user = db.User.getById(id);
	if (!user) return;
	if (!user.roles.has('user')) return;
	if (!this.user.users.has(user)) return;
	return user;
};

module.exports = function (routes, data) {
	var name, partA, partB, constraint;
	(object(routes) && object(data));
	name = stringifiable(data.name);
	partA = object(data.partA);
	partB = object(data.partB);
	constraint = (data.constraint != null) && callable(data.constraint);

	// Cleanup
	keys(routes).forEach(function (key) {
		delete partA[key];
		delete partB[key];
	});

	// Validate for uniqueness
	keys(partB).some(function (key) {
		if (partA[key]) {
			throw new TypeError("Post routes of user must be unique against " +
				"user submitted routes. Key found in both: '" + key + "'");
		}
	});

	if (db.User.prototype.isApplicationCompleted === undefined) {
		throw new TypeError("Nested user routes rely on existence of user.isApplicationCompleted " +
			"property");
	}

	// Part A
	assign(routes, nest(name + '/[0-9][0-9a-z]+', partA, function (id) {
		var user = matchUser.call(this, id);
		if (!user) return false;
		if (user.isApplicationCompleted) return false;
		if (constraint && !constraint.call(this, user)) return false;
		this.user = user;
		return true;
	}));

	// Part B
	assign(routes, nest(name + '/[0-9][0-9a-z]+', partB, function (id) {
		var user = matchUser.call(this, id);
		if (!user) return false;
		if (!user.isApplicationCompleted) return false;
		if (constraint && !constraint.call(this, user)) return false;
		this.user = user;
		return true;
	}));
};
