'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db         = new Database()
	  , MasterType = db.Object.extend('MasterType')
	  , UsDollar   = require('dbjs-ext/number/currency/us-dollar')(db)

	  , masterObject;

	// ------------------ Setup ------------------

	var MinMaxType = t('MinMaxType', UsDollar);

	MasterType.prototype.defineProperties({
		minMaxField: {
			type: MinMaxType,
			nested: true
		},
		someProperty: {
			type: UsDollar
		}
	});

	MasterType.prototype.minMaxField.set('min', function () {
		return this.master.someProperty + 1;
	});

	masterObject = new MasterType();

	// ------------------ Tests ------------------

	a.h1('Dynamic fields');
	a(masterObject.minMaxField.hasPropertyDefined('value'), true);
	a(masterObject.minMaxField.hasPropertyDefined('resolvedValue'), true);
	a(masterObject.minMaxField.hasPropertyDefined('min'), true);
	a(masterObject.minMaxField.hasPropertyDefined('max'), true);

	a(masterObject.minMaxField.value, undefined);
	a(masterObject.minMaxField.resolvedValue, null);

	masterObject.someProperty = 1;
	masterObject.minMaxField.value = 1;
	a(masterObject.minMaxField.resolvedValue, null);

	masterObject.minMaxField.value = 2;
	a(masterObject.minMaxField.resolvedValue, 2);
	a(masterObject.minMaxField.toString(), '$2.00');
};
