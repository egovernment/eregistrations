'use strict';

var validDb               = require('dbjs/valid-dbjs')
  , validDbType           = require('dbjs/valid-dbjs-type')
  , definePercentage      = require('dbjs-ext/number/percentage')
  , defineFormSectionBase = require('./form-section-base');

module.exports = function (Entity, property) {
	var FormSectionBase, Percentage, db;
	db = validDb(Entity.database);
	validDbType(Entity);
	FormSectionBase = defineFormSectionBase(db);
	Percentage = definePercentage(db);
	Entity.prototype.define(property, {
		type: db.Object,
		nested: true
	});
	Entity.prototype[property]._descriptorPrototype_.type = FormSectionBase;
	Entity.prototype[property]._descriptorPrototype_.nested = true;
	Entity.prototype.define(property + 'Status', { type: Percentage, value:
		new Function('_observe', '\'use strict\'; var sum; sum = 0; this.' +
			property +
			'.forEach(function (section) { sum += _observe(section._status); }); return sum / this.'
			+ property + '.size;')
		});

	return Entity;
};
