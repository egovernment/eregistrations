/** Responsible for setting up sections map.
 * @param {db.Object} Entity - The model for which we define sections.
 * @param {string} property - The name of the property under which we create sections map.
 * Usually we use 'formSections' as property.
 * @returns {db.Object} Entity
 */

'use strict';

var validDb               = require('dbjs/valid-dbjs')
  , validDbType           = require('dbjs/valid-dbjs-type')
  , defineUInteger        = require('dbjs-ext/number/integer/u-integer')
  , definePercentage      = require('dbjs-ext/number/percentage')
  , defineFormSectionBase = require('./form-section-base');

module.exports = function (Entity, property) {
	var FormSectionBase, Percentage, db, UInteger;
	db = validDb(Entity.database);
	validDbType(Entity);
	UInteger        = defineUInteger(db);
	FormSectionBase = defineFormSectionBase(db);
	Percentage      = definePercentage(db);
	Entity.prototype.define(property, {
		type: db.Object,
		nested: true
	});
	Entity.prototype[property]._descriptorPrototype_.type = FormSectionBase;
	Entity.prototype[property]._descriptorPrototype_.nested = true;
	Entity.prototype.define(property + 'Status', { type: Percentage, value:
		new Function('_observe', '\'use strict\'; var sum, weightTotal; sum = 0; weightTotal = 0;' +
			'this.' +
			property +
			'.forEach(function (section) {' +
			'if (_observe(section._isApplicable)) { ' +
			'sum += (_observe(section._status) * _observe(section._weight));' +
			' weightTotal += section.weight; }' +
			'}); if (!weightTotal) return 1; return sum / weightTotal;')
		});
	Entity.prototype.define(property + 'Weight', { type: UInteger, value:
		new Function('_observe', '\'use strict\'; var weightTotal; weightTotal = 0;' +
			'this.' +
			property +
			'.forEach(function (section) {' +
			'if (_observe(section._isApplicable)) { ' +
			' weightTotal += _observe(section._weight); }' +
			'}); return weightTotal;')
		});

	return Entity;
};
