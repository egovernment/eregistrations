// Inspector dedicated search query handler
// (used to handle processing steps table in inspector role)

'use strict';

var db                = require('../../db')
  , uniq              = require('es5-ext/array/#/uniq')
  , customError       = require('es5-ext/error/custom')
  , uncapitalize      = require('es5-ext/string/#/uncapitalize')
  , capitalize        = require('es5-ext/string/#/capitalize')

  , stringify         = JSON.stringify
  , wsRe              = /\s{2,}/g;

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
		var serviceFound;

		if (!value) return;

		serviceFound = db.BusinessProcess.extensions.some(function (ServiceType) {
			return uncapitalize.call(ServiceType.__id__.slice('BusinessProcess'.length)) === value;
		});

		if (!serviceFound) {
			throw new Error("Unrecognized service value " + stringify(value));
		}

		return value;
	}
}, {
	name: 'registration',
	ensure: function (value, resolvedQuery) {
		var service = resolvedQuery.service
		  , inscriptionFound;

		var searchCertificates = function (certificates) {
			return certificates.some(function (certificate, certificateName) {
				return certificateName === value;
			});
		};

		if (!value) return;

		if (service) {
			service          = db['BusinessProcess' + capitalize.call(service)];
			inscriptionFound = searchCertificates(service.prototype.certificates.map);
		} else {
			inscriptionFound = db.BusinessProcess.extensions.some(function (ServiceType) {
				return searchCertificates(ServiceType.prototype.certificates.map);
			});
		}

		if (!inscriptionFound) {
			throw new Error("Unrecognized inscription value " + stringify(value));
		}

		return value;
	}
}, {
	name: 'submitterType',
	ensure: function (value) {
		var SubmitterType = db.BusinessProcess.prototype.getDescriptor('submitterType').type;

		if (!value) return;

		if (!SubmitterType.members.has(value)) {
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
		if (!value) return;
		// TODO
		return value;
	}
}];
