// Inspector dedicated search query handler
// (used to handle processing steps table in inspector role)

'use strict';

var db              = require('../../db')
  , uniq            = require('es5-ext/array/#/uniq')
  , customError     = require('es5-ext/error/custom')
  , uncapitalize    = require('es5-ext/string/#/uncapitalize')
  , isNaturalNumber = require('es5-ext/number/is-natural')
  , Set             = require('es6-set')
  , Map             = require('es6-map')

  , stringify       = JSON.stringify
  , wsRe            = /\s{2,}/g;

var servicesAndRegistrations = new Map();
var allRegistrations = new Set();
var submitterTypes = db.BusinessProcess.prototype.getDescriptor('submitterType').type.members;

db.BusinessProcess.extensions.forEach(function (ServiceType) {
	var serviceShortName = uncapitalize.call(ServiceType.__id__.slice('BusinessProcess'.length))
	  , registrations    = new Set();

	ServiceType.prototype.registrations.map.forEach(function (registration, registrationName) {
		allRegistrations.add(registrationName);
		registrations.add(registrationName);
	});

	servicesAndRegistrations.set(serviceShortName, registrations);
});

var servicesMap = db.BusinessProcess.extensions.map(function (ServiceType) {
	return uncapitalize.call(ServiceType.__id__.slice('BusinessProcess'.length));
});

module.exports = [{
	name: 'status',
	ensure: function (value) {
		if (!value) return;

		if (!db.BusinessProcessStatus.members.has(value)) {
			throw new Error("Unrecognized status value " + stringify(value));
		}

		return value;
	}
}, {
	name: 'service',
	ensure: function (value) {
		if (!value) return;

		if (!servicesMap.has(value)) {
			throw new Error("Unrecognized service value " + stringify(value));
		}

		return value;
	}
}, {
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
}, {
	name: 'submitterType',
	ensure: function (value) {
		if (!value) return;

		if (!submitterTypes.has(value)) {
			throw new Error("Unrecognized user type value " + stringify(value));
		}

		return value;
	}
}, {
	name: 'search',
	ensure: function (value) {
		var expected;

		if (!value) return;

		expected = value.toLowerCase().replace(wsRe, ' ');
		if (value !== expected) {
			throw customError("Non normative search value", { fixedQueryValue: expected });
		}

		expected = uniq.call(expected.split(/\s/)).join(' ');
		if (value !== expected) {
			throw customError("Non normative search value", { fixedQueryValue: expected });
		}

		return value;
	}
}, {
	name: 'page',
	ensure: function (value) {
		var num;

		if (value == null) return 1;

		if (isNaN(value)) throw new Error("Unrecognized page value " + stringify(value));
		num = Number(value);
		if (!isNaturalNumber(num)) throw new Error("Unreconized page value " + stringify(value));
		if (!num) throw new Error("Unexpected page value " + stringify(value));

		return value;
	}
}];
