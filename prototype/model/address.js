'use strict';

var db         = require('mano').db
  , Map        = require('es6-map')
  , StringLine = require('dbjs-ext/string/string-line')(db)
  , StreetTypeChoice;

StreetTypeChoice = StringLine.createEnum('StreetTypeChoice', new Map([
	['street', {
		label: "Street"
	}],
	['avenue', {
		label: "Avenue"
	}],
	['diagonal', {
		label: "Diagonal"
	}],
	['road', {
		label: "Road"
	}]
]));

module.exports = db.Object.extend('Address', {
	city: { type: StringLine, required: true, label: "City" },
	streetType: { type: StreetTypeChoice, value: 'street', required: true },
	streetName: { type: StringLine, required: true },
	street: { type: StringLine, label: "Type of street", required: true,
		value: function () {
			if (!this.streetType || !this.streetName) return null;
			return this.database.StreetTypeChoice.meta[this.streetType].label + ' ' + this.streetName;
		} },
	streetNumber: { type: StringLine, required: true, label: "Street number" },
	apartmentNumber: { type: StringLine, label: "Apartment number" }
});
