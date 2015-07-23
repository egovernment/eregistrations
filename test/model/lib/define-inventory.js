'use strict';

var defineUsDollar = require('dbjs-ext/number/currency/us-dollar')
  , Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , UsDollar = defineUsDollar(db)
	  , container = db.Object.newNamed('inventoryContainer');
	t(db);

	container.defineInventory('inventory', {
		currencyType: UsDollar,
		assets: {
			label: "Property",
			inputPlaceholder: "Property #1",
			description: "All the buildings, land and other immovable property belonging to the " +
				"merchant and are affected to their activity."
		},
		machinery: {
			label: "Machinery, equipment and vehicles",
			inputPlaceholder: "Machinery, equipment and vehicles #1",
			description: "All the machines, tools, computer equipment, vehicles and other movable " +
				"property affected to the commercial activity.",
			addLabel: "Add"
		}
	});

	a(container.inventory.getDescriptor('assets').label, "Property");
	container.inventory.assets.map.get('mop').setProperties({
		description: "Great for cleaning floors",
		value: 150
	});
	a(container.inventory.assets.ordered.first.value, 150);
};
