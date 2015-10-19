'use strict';

var assign        = require('es5-ext/object/assign')
  , copy          = require('es5-ext/object/copy')
  , callable      = require('es5-ext/object/valid-callable')
  , object        = require('es5-ext/object/valid-object')
  , stringifiable = require('es5-ext/object/validate-stringifiable-value')
  , nest          = require('mano/utils/nest-post-controllers')
  , db            = require('mano').db

  , commonPaths = Object.keys(require('./user'))
  , keys = Object.keys;

var matchBusinessProcess = function (id) {
	var businessProcess = db.BusinessProcess.getById(id);
	if (!businessProcess) return;
	if (!this.user.users.has(businessProcess)) return;
	return businessProcess;
};

module.exports = function (routes, data) {
	var name, partA, partB, constraint;
	(object(routes) && object(data));
	name = stringifiable(data.name);
	partA = copy(data.partA);
	partB = copy(data.partB);
	constraint = (data.constraint != null) && callable(data.constraint);

	// Cleanup
	commonPaths.forEach(function (key) {
		delete partA[key];
		delete partB[key];
	});

	// Validate for uniqueness
	keys(partB).some(function (key) {
		if (partA[key]) {
			throw new TypeError("Post routes of businessProcess must be unique against " +
				"businessProcess submitted routes. Key found in both: '" + key + "'");
		}
	});

	// Part A
	assign(routes, nest(name + '/[0-9][0-9a-z]+', partA, function (id) {
		var businessProcess = matchBusinessProcess.call(this, id);
		if (!businessProcess) return false;
		if (businessProcess.isApplicationCompleted) return false;
		if (constraint && !constraint.call(this, businessProcess)) return false;
		this.user = businessProcess.user;
		return true;
	}));

	// Part B
	assign(routes, nest(name + '/[0-9][0-9a-z]+', partB, function (id) {
		var businessProcess = matchBusinessProcess.call(this, id);
		if (!businessProcess) return false;
		if (!businessProcess.isApplicationCompleted) return false;
		if (constraint && !constraint.call(this, businessProcess)) return false;
		this.user = businessProcess.user;
		return true;
	}));
};
