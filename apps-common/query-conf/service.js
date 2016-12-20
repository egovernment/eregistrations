'use strict';

var db           = require('../../db')
  , uncapitalize = require('es5-ext/string/#/uncapitalize')
  , stringify    = JSON.stringify
  , servicesMap;

servicesMap = db.BusinessProcess.extensions.map(function (ServiceType) {
	return uncapitalize.call(ServiceType.__id__.slice('BusinessProcess'.length));
});

module.exports = {
	name: 'service',
	ensure: function (value) {
		if (!value) return;

		if (!servicesMap.has(value)) {
			throw new Error("Unrecognized service value " + stringify(value));
		}

		return value;
	}
};
