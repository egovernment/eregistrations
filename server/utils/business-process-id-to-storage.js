'use strict';

var ensureString    = require('es5-ext/object/validate-stringifiable-value')
  , storagesPromise = require('./business-process-storages')
  , getIdToStorage  = require('./get-id-to-storage')

  , getId;

storagesPromise.done(function (storages) { getId = getIdToStorage(storages); });

module.exports = function self(id) {
	ensureString(id);
	if (!getId) {
		return storagesPromise(function () { return self(id); });
	}
	return getId(id);
};
