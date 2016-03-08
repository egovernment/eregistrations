// Users admin GET controllers

'use strict';

var flatten             = require('es5-ext/array/#/flatten')
  , isNaturalNumber     = require('es5-ext/number/is-natural')
  , toNaturalNumber     = require('es5-ext/number/to-pos-integer')
  , normalizeOptions    = require('es5-ext/object/normalize-options')
  , toArray             = require('es5-ext/object/to-array')
  , ensureObject        = require('es5-ext/object/valid-object')
  , ensureSet           = require('es6-set/valid-set')
  , deferred            = require('deferred')
  , memoize             = require('memoizee/plain')
  , mano                = require('mano')
  , QueryHandler        = require('../../utils/query-handler')
  , defaultItemsPerPage = require('../../conf/objects-list-items-per-page')
  , getDbSet            = require('../utils/get-db-set')
  , getDbArray          = require('../utils/get-db-array')
  , slice = Array.prototype.slice, ceil = Math.ceil
  , stringify = JSON.stringify;

require('memoizee/ext/max-age');

var userQueryHandler = new QueryHandler([{
	name: 'id',
	ensure: function (value) {
		if (!value) throw new Error("Missing id");
		return mano.dbDriver.getStorage('user')
			.getComputed(value + '/roles')(function (data) {
			if (!data || (data.value !== '3manager')) return null;
				return value;
			});
	}
}]);

module.exports = exports = function (data) {
	data = normalizeOptions(ensureObject(data));
	var listProps = ensureSet(data.listProperties)
	  , tableQueryHandler = new QueryHandler(exports.tableQueryConf)
	  , itemsPerPage = toNaturalNumber(data.itemsPerPage) || defaultItemsPerPage;

	var getTableData = memoize(function (query) {
		var storage = mano.dbDriver.getStorage('user');
		return getDbSet(storage, 'direct', 'roles', '3manager')(function (set) {
			return getDbArray(set, storage, 'direct', null)(function (arr) {
				var pageCount, offset, size = arr.length;
				if (!size) return { size: size };
				pageCount = ceil(size / itemsPerPage);
				if (query.page > pageCount) return { size: size };

				// Pagination
				offset = (query.page - 1) * itemsPerPage;
				arr = slice.call(arr, offset, offset + itemsPerPage);
				return deferred.map(arr, function (data) {
					return storage.getObject(data.id, { keyPaths: listProps })(function (datas) {
						return datas.map(function (data) {
							return data.data.stamp + '.' + data.id + '.' + data.data.value;
						});
					});
				})(function (directEvents) {
					return {
						view: arr.map(function (data) { return data.stamp + '.' + data.id; }).join('\n'),
						size: size,
						data: flatten.call(directEvents)
					};
				});
			});
		});
	}, {
		normalizer: function (args) { return String(toArray(args[0], null, null, true)); },
		maxAge: 10 * 1000
	});

	return {
		'get-users-view': function (query) {
			return tableQueryHandler.resolve(query)(function (query) { return getTableData(query); });
		},
		'get-user-data': function (query) {
			return userQueryHandler.resolve(query)(function (query) {
				var recordId;
				if (!query.id || (this.req.$user === query.id)) return { passed: false };
				recordId = this.req.$user + '/recentlyVisited/users*7' + query.id;
				return mano.dbDriver.getStorage('user').store(recordId, '11')({ passed: true });
			}.bind(this));
		}
	};
};

exports.tableQueryConf = [{
	name: 'page',
	ensure: function (value) {
		var num;
		if (isNaN(value)) throw new Error("Unrecognized page value " + stringify(value));
		num = Number(value);
		if (!isNaturalNumber(num)) throw new Error("Unreconized page value " + stringify(value));
		if (!num) throw new Error("Unexpected page value " + stringify(value));
		return value;
	}
}];
