'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db         = new Database()
	  , MasterType = db.Object.extend('MasterType')
	  , UsDollar   = require('dbjs-ext/number/currency/us-dollar')(db)

	  , masterObject;

	// ------------------ Setup ------------------

	MasterType.prototype.defineProperties({
		constrainedProperty: {
			type: db.Object,
			nested: true
		},
		someProperty: {
			type: UsDollar
		}
	});

	t(MasterType.prototype.constrainedProperty, UsDollar, {
		min: function () {
			return this.master.someProperty + 1;
		}
	});

	masterObject = new MasterType();

	// ------------------ Tests ------------------

	a.h1('Dynamic fields');
	a(masterObject.constrainedProperty.hasPropertyDefined('value'), true);
	a(masterObject.constrainedProperty.hasPropertyDefined('resolvedValue'), true);
	a(masterObject.constrainedProperty.hasPropertyDefined('min'), true);
	a(masterObject.constrainedProperty.hasPropertyDefined('max'), false);

	a(masterObject.constrainedProperty.value, undefined);
	a(masterObject.constrainedProperty.resolvedValue, null);

	masterObject.someProperty = 1;
	masterObject.constrainedProperty.value = 1;
	a(masterObject.constrainedProperty.resolvedValue, null);

	masterObject.constrainedProperty.value = 2;
	a(masterObject.constrainedProperty.resolvedValue, 2);
};
