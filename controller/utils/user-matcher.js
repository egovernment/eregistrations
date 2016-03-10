'use strict';

var db = require('mano').db;

module.exports = function (id) {
	var target = db.User.getById(id);
	if (!target) return false;
	this.targetId = id;
	this.target = target;
	return true;
};
