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

	var storage = ensureStorage(data.storage)
	  , serviceName = uncapitalize.call(type.__id__.slice('BusinessProcess'.length))
	  , ns = 'statistics/businessProcess/' + serviceName + '/certificate/'
	  , instances = resolveInstances(type).filterByKey('isSubmitted', true);

	type.prototype.certificates.map.forEach(function (cert, key) {
		var applicable = instances.filterByKeyPath('certificates/applicable', function (col) {
			if (!col.object.master.certificates) return false;
			return col.has(col.object.master.certificates.map[key]);
		});
		var currentNs = ns + key + '/'
		  , keyPath = 'certificates/map/' + key + '/status';
		storage.trackCollectionSize(currentNs + 'waiting', applicable.filterByKeyPath(keyPath, null));
		storage.trackCollectionSize(currentNs + 'pending',
			applicable.filterByKeyPath(keyPath, 'pending'));
		storage.trackCollectionSize(currentNs + 'approved',
			applicable.filterByKeyPath(keyPath, 'approved'));
		storage.trackCollectionSize(currentNs + 'rejected',
			applicable.filterByKeyPath(keyPath, 'rejected'));
	});
};
