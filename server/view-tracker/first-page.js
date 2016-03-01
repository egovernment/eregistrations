'use strict';

var ensureArray         = require('es5-ext/array/valid-array')
  , toNaturalNumber     = require('es5-ext/number/to-pos-integer')
  , ensureString        = require('es5-ext/object/validate-stringifiable-value')
  , deferred            = require('deferred')
  , ensureObservableSet = require('observable-set/valid-observable-set')
  , serializeValue      = require('dbjs/_setup/serialize/value')
  , ensureStorage       = require('dbjs-persistence/ensure-storage')
  , serializeView       = require('../../utils/db-view/serialize')
  , defaultItemsPerPage = require('../../conf/objects-list-items-per-page');

module.exports = function (storage, snapshotPath, set, array/*, options*/) {
	var sizeRecordId, viewRecordId, options = Object(arguments[4]), itemsPerPage;
	snapshotPath = ensureString(snapshotPath);
	ensureObservableSet(set);
	ensureArray(array);
	ensureStorage(storage);
	if (options.itemsPerPage != null) itemsPerPage = toNaturalNumber(options.itemsPerPage);
	if (!itemsPerPage) itemsPerPage = defaultItemsPerPage;

	sizeRecordId = 'views/' + snapshotPath + '/totalSize';
	viewRecordId = 'views/' + snapshotPath + '/21';

	set._size.on('change', function () {
		storage.storeReduced(sizeRecordId, serializeValue(set.size)).done();
	});
	array.on('change', function () {
		storage.storeReduced(viewRecordId, serializeValue(serializeView(array.slice(0, itemsPerPage))))
			.done();
	});
	return deferred(
		storage.storeReduced(sizeRecordId, serializeValue(set.size)),
		storage.storeReduced(viewRecordId, serializeValue(serializeView(array.slice(0, itemsPerPage))))
	);
};
