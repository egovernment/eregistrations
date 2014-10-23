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
		type: db.Object,
		nested: true
	});
	Entity.prototype[property]._descriptorPrototype_.type = FormSectionBase;
	Entity.prototype[property]._descriptorPrototype_.nested = true;

	return Entity;
};
