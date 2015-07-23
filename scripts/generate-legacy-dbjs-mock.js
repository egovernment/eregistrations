// Use

'use strict';

var deferred  = require('deferred')
  , serialize = require('es5-ext/object/serialize')
  , writeFile = require('fs2/write-file')
  , db        = require('mano').db
  , Currency  = require('dbjs-ext/number/currency')(db)
  , Cost      = require('eregistrations/model/cost')(db);

var defineForEach = function (object) {
	object.forEach = new Function('cb, thisArg', '$.dbjsMapForEach(this, cb, thisArg);');
};

module.exports = function (businessProcessTypeName, filename, customizeCb) {
	var legacyDb = {}, businessProcessProto, certificates = {}, costs = {}, registrations = {}
	  , requirements = {}, currencyType = {}, costType = {};

	// Get BusinessProcess prototype.
	businessProcessProto = db[businessProcessTypeName].prototype;

	if (!businessProcessProto) {
		throw new Error('Cannot get prototype of BusinessProcess:' + businessProcessTypeName);
	}

	// Get all interesting fields from BusinessProcess prototype.
	var getPropertyValue = function (multipleProcessName, propertyName) {
		return businessProcessProto[multipleProcessName].getDescriptor(propertyName)._value_;
	};

	var copyMapEntities = function (propertyName, entitiesPropertyNames) {
		var result = {};

		// To allow copying 'empty' entities.
		if (!entitiesPropertyNames) entitiesPropertyNames = [];

		businessProcessProto[propertyName].map.forEach(function (item, key) {
			var entity = {};

			entitiesPropertyNames.forEach(function (entityPropertyName) {
				entity[entityPropertyName] = item.getDescriptor(entityPropertyName)._value_;
			});

			result[key] = entity;
		});

		return result;
	};

	// Assure each map implements forEach.
	[certificates.map, costs.map, registrations.map, requirements.map].forEach(defineForEach);

	// Copy maps.
	certificates.map  = copyMapEntities('certificates');
	costs.map         = copyMapEntities('costs', ['amount']);
	registrations.map = copyMapEntities('registrations', ['isApplicable', 'isMandatory',
		'isRequested', 'certificates', 'requirements', 'costs']);
	requirements.map  = copyMapEntities('requirements', ['isApplicable']);

	// Copy MultipleProcess resolvers.
	certificates.applicable  = getPropertyValue('certificates', 'applicable');
	costs.applicable         = getPropertyValue('costs', 'applicable');
	costs.payable            = getPropertyValue('costs', 'payable');
	costs.totalAmount        = getPropertyValue('costs', 'totalAmount');
	registrations.applicable = getPropertyValue('registrations', 'applicable');
	registrations.mandatory  = getPropertyValue('registrations', 'mandatory');
	registrations.optional   = getPropertyValue('registrations', 'optional');
	registrations.requested  = getPropertyValue('registrations', 'requested');
	requirements.resolved    = getPropertyValue('requirements', 'resolved');
	requirements.applicable  = getPropertyValue('requirements', 'applicable');

	// Copy less interesting (support) stuff also.
	currencyType.format = Currency.format;
	currencyType.symbol = db.Cost.prototype.getDescriptor('amount').type.symbol;
	currencyType.isoCode = db.Cost.prototype.getDescriptor('amount').type.isoCode;
	costType.step = Cost.prototype.getDescriptor('amount').step;

	// Add everything to legacyDb
	legacyDb[businessProcessTypeName] = {
		prototype: {
			certificates: certificates,
			costs: costs,
			registrations: registrations,
			requirements: requirements
		}
	};
	legacyDb.Currency = currencyType;
	legacyDb.Cost = costType;

	// Allow customizations on legacyDb.
	if (customizeCb) customizeCb(legacyDb);

	// Store file.
	return deferred(writeFile(filename,
			'\'use strict\';\n\n' +
			'var $ = require(\'mano-legacy\');\n' +
			'require(\'mano-legacy/dbjs-map-for-each\');\n\n' +
			'module.exports = ' + serialize(legacyDb) + ';\n')
		);
};
