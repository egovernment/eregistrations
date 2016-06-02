'use strict';

var ensureObject = require('es5-ext/object/valid-object')
  , ensureString = require('es5-ext/object/validate-stringifiable-value')
  , ensureArray  = require('es5-ext/array/valid-array')
  , db           = require('mano').db
  , flatten      = require('es5-ext/array/#/flatten');

module.exports = function () {
	return function (query) {
		var fromBusinessProcessId, toBusinessProcessId, propertyPaths = [], fromBusinessProcessProto,
			fromStorage, toStorage, additionalProperties;

		ensureObject(query);
		fromBusinessProcessId = ensureString(query.fromBusinessProcessId);
		toBusinessProcessId   = ensureString(query.toBusinessProcessId);
		additionalProperties  = query.additionalProperties && ensureArray(query.additionalProperties);
		fromStorage           =
			require('mano').dbDriver.getStorage(ensureString(query.fromStorageName));
		toStorage             =
			require('mano').dbDriver.getStorage(query.fromStorageName + 'Update');

		return fromStorage.getObject(fromBusinessProcessId)(function (records) {
			var updateRecords = [], filteredRecords;
			if (!records.length) return;
			fromBusinessProcessProto = db[records[0].data.value.replace(/^7(.+?)#$/, '$1')].prototype;

			propertyPaths.push.apply(propertyPaths,
				fromBusinessProcessProto.determinants.propertyNamesDeep.toArray());
			fromBusinessProcessProto.dataForms.map.forEach(function (section) {
				propertyPaths.push.apply(propertyPaths, section.propertyNamesDeep.toArray());
			});
			if (additionalProperties) {
				propertyPaths = propertyPaths.concat(additionalProperties);
			}
			propertyPaths.push('requirementUploads');

			propertyPaths = flatten.call(propertyPaths);

			filteredRecords = records.filter(function (record) {
				return propertyPaths.some(function (path) {
					return record.id.match(path);
				});
			});
			filteredRecords.forEach(function (record) {
				updateRecords.push({
					id: record.id.replace(fromBusinessProcessId, toBusinessProcessId),
					data: record.data
				});
				updateRecords.push({
					id: record.id.replace(fromBusinessProcessId, toBusinessProcessId + '/previousProcess'),
					data: record.data
				});
			});

			return toStorage.storeMany(updateRecords)(true);
		});
	};
};
