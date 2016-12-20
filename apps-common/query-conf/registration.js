'use strict';

var db                       = require('../../db')
  , uncapitalize             = require('es5-ext/string/#/uncapitalize')
  , Set                      = require('es6-set')
  , Map                      = require('es6-map')
  , stringify                = JSON.stringify

  , servicesAndRegistrations = new Map()
  , allRegistrations         = new Set();

db.BusinessProcess.extensions.forEach(function (ServiceType) {
	var serviceShortName = uncapitalize.call(ServiceType.__id__.slice('BusinessProcess'.length))
	  , registrations    = new Set();

	ServiceType.prototype.registrations.map.forEach(function (registration, registrationName) {
		allRegistrations.add(registrationName);
		registrations.add(registrationName);
	});

	servicesAndRegistrations.set(serviceShortName, registrations);
});

module.exports = {
	name: 'registration',
	ensure: function (value, resolvedQuery) {
		var service = resolvedQuery.service
		  , inscriptionFound;

		if (!value) return;

		if (service && servicesAndRegistrations.has(service)) {
			inscriptionFound = servicesAndRegistrations.get(service).has(value);
		} else {
			inscriptionFound = allRegistrations.has(value);
		}

		if (!inscriptionFound) {
			throw new Error("Unrecognized inscription value " + stringify(value));
		}

		return value;
	}
};
