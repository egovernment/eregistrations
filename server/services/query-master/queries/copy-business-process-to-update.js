'use strict';

var ensureObject = require('es5-ext/object/valid-object')
  , ensureString = require('es5-ext/object/validate-stringifiable-value')
  , ensureArray  = require('es5-ext/array/valid-array')
  , db           = require('mano').db
  , flatten      = require('es5-ext/array/#/flatten')
  , escape       = require('es5-ext/reg-exp/escape')
  , aFrom        = require('es5-ext/array/from')
  , idToStorage  = require('../../../utils/any-id-to-storage');

module.exports = function () {
	return function (query) {
		var fromBusinessProcessId, toBusinessProcessId, propertyPaths = [], fromBusinessProcessProto,
			additionalProperties;

		ensureObject(query);
		fromBusinessProcessId = ensureString(query.fromBusinessProcessId);
		toBusinessProcessId   = ensureString(query.toBusinessProcessId);
		additionalProperties  = query.additionalProperties && ensureArray(query.additionalProperties);

		return idToStorage(fromBusinessProcessId)(function (fromStorage) {
			if (!fromStorage) return;
			return idToStorage(toBusinessProcessId)(function (toStorage) {
				if (!toStorage) return;
				return fromStorage.getObject(fromBusinessProcessId)(function (records) {
					var updateRecords = [], filteredRecords;
					if (!records.length) return;
					fromBusinessProcessProto = db[records[0].data.value.replace(/^7(.+?)#$/, '$1')].prototype;

					propertyPaths =
						propertyPaths.concat(aFrom(fromBusinessProcessProto.determinants.propertyNamesDeep));
					fromBusinessProcessProto.dataForms.map.forEach(function (section) {
						propertyPaths = propertyPaths.concat(aFrom(section.propertyNamesDeep));
					});
					propertyPaths = flatten.call(propertyPaths).map(function (keyPath) {
						return new RegExp('^\\d[a-z0-9]+\\\/' + escape(keyPath) + '(\\*|$)');
					});
					if (additionalProperties) {
						propertyPaths = flatten.call(
							propertyPaths.concat(additionalProperties.map(function (keyPath) {
								return new RegExp('^\\d[a-z0-9]+\\\/' + escape(keyPath));
							}))
						);
					}
					propertyPaths.push(
						new RegExp(
							'^\\d[a-z0-9]+\\\/requirementUploads\\\/map\\\/' +
								'[a-zA-Z0-9]+\\\/document\\\/files\\\/map\\\/'
						)
					);
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
							id:
								record.id.replace(fromBusinessProcessId, toBusinessProcessId + '/previousProcess'),
							data: record.data
						});
					});
					return toStorage.storeMany(updateRecords)(true);
				});
			});
		});
	};
};
