'use strict';

var validDb               = require('dbjs/valid-dbjs')
  , validDbType           = require('dbjs/valid-dbjs-type')
  , defineFormSectionBase = require('./form-section-base');

module.exports = function (Entity, property) {
	var FormSectionBase, db;
	db = validDb(Entity.database);
	validDbType(Entity);
	FormSectionBase = defineFormSectionBase(db);
	Entity.prototype.define(property, {
		type: FormSectionBase,
		reverse: 'entityPrototype',
		unique: true,
		multiple: true
	});
	return Entity;
};
