'use strict';

var ensureObject     = require('es5-ext/object/valid-object')
  , uncapitalize     = require('es5-ext/string/#/uncapitalize')
  , ensureType       = require('dbjs/valid-dbjs-type')
  , ensureStorage    = require('dbjs-persistence/ensure-storage')
  , resolveInstances = require('../../../business-processes/resolve')

  , isBusinessProcessType = RegExp.prototype.test.bind(/^BusinessProcess[A-Z]/);

module.exports = function (type, data) {
	ensureType(type);
	if (!isBusinessProcessType(type.__id__)) {
		throw new TypeError("Expected BusinessProcess type, but got " + type.__id__);
	}
	ensureObject(data);

	var storage     = ensureStorage(data.storage)
	  , serviceName = uncapitalize.call(type.__id__.slice('BusinessProcess'.length))
	  , ns          = 'statistics/businessProcess/' + serviceName + '/certificate/'
	  , instances   = resolveInstances(type).filterByKey('isSubmitted', true);

	type.prototype.certificates.map.forEach(function (cert, key) {
		var currentNs = ns + key + '/'
		  , keyPath   = 'certificates/map/' + key + '/status';

		var applicable = instances.filterByKeyPath('certificates/applicable', function (col) {
			if (!col.object.master.certificates) return false;
			return col.has(col.object.master.certificates.map[key]);
		});

		var pending   = applicable.filterByKeyPath(keyPath, 'pending');
		var sentBack  = applicable.filterByKey('status', 'sentBack');
		var approved  = applicable.filterByKeyPath(keyPath, 'approved');
		var rejected  = applicable.filterByKeyPath(keyPath, 'rejected');
		var pickup    = approved.filterByKey('status', 'pickup');
		var withdrawn = approved.filterByKey('status', 'withdrawn');

		storage.trackCollectionSize(currentNs + 'waiting', applicable.filterByKeyPath(keyPath, null));
		storage.trackCollectionSize(currentNs + 'pending', pending);
		storage.trackCollectionSize(currentNs + 'sentBack', sentBack);
		storage.trackCollectionSize(currentNs + 'approved', approved);
		storage.trackCollectionSize(currentNs + 'rejected', rejected);
		storage.trackCollectionSize(currentNs + 'pickup', pickup);
		storage.trackCollectionSize(currentNs + 'withdrawn', withdrawn);
	});
};
