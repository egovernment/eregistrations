// Users admin GET controllers

'use strict';

var flatten             = require('es5-ext/array/#/flatten')
  , remove              = require('es5-ext/array/#/remove')
  , isNaturalNumber     = require('es5-ext/number/is-natural')
  , toNaturalNumber     = require('es5-ext/number/to-pos-integer')
  , normalizeOptions    = require('es5-ext/object/normalize-options')
  , toArray             = require('es5-ext/object/to-array')
  , ensureObject        = require('es5-ext/object/valid-object')
  , d                   = require('d')
  , ensureSet           = require('es6-set/valid-set')
  , deferred            = require('deferred')
  , memoize             = require('memoizee/plain')
  , mano                = require('mano')
  , QueryHandler        = require('../../utils/query-handler')
  , defaultItemsPerPage = require('../../conf/objects-list-items-per-page')
  , getBaseSet          = require('../users/get-observable-set')

  , slice = Array.prototype.slice, ceil = Math.ceil
  , create = Object.create, defineProperty = Object.defineProperty, stringify = JSON.stringify
  , compareStamps = function (a, b) { return a.stamp - b.stamp; };

require('memoizee/ext/max-age');

var userQueryHandler = new QueryHandler([{
	name: 'id',
	ensure: function (value) {
		if (!value) throw new Error("Missing id");
		return mano.dbDriver.getComputed(value + '/isActiveAccount')(function (data) {
			if (!data || (data.value !== '11')) return null;
			return value;
		});
	}
}]);

var getSortedArray = memoize(function () {
	return getBaseSet()(function (set) {
		var arr = [], itemsMap = create(null)
		  , count = 0, isInitialized = false, def = deferred(), setListener;
		var add = function (ownerId) {
			return deferred(itemsMap[ownerId] || mano.dbDriver.getDirect(ownerId))
				.aside(function (data) {
					if (!set.has(ownerId)) return;
					if (!itemsMap[ownerId]) itemsMap[ownerId] = { id: ownerId, stamp: data.stamp };
					arr.push(itemsMap[ownerId]);
					if (def.resolved) arr.sort(compareStamps);
				});
		};
		set.on('change', setListener = function (event) {
			if (event.type === 'add') add(event.value).done();
			else remove.call(arr, itemsMap[event.value]);
		});
		set.forEach(function (ownerId) {
			++count;
			add(ownerId).done(function () {
				if (!--count && isInitialized) def.resolve(arr.sort(compareStamps));
			});
		});
		isInitialized = true;
		if (!count) def.resolve(arr.sort(compareStamps));
		defineProperty(set, '_dispose', d(function () { set.off(setListener); }));
		return def.promise;
	});
}, { max: 1000, dispose: function (arr) { arr._dispose(); } });

module.exports = exports = function (data) {
	data = normalizeOptions(ensureObject(data));
	var listProps = ensureSet(data.listProperties)
	  , tableQueryHandler = new QueryHandler(exports.tableQueryConf)
	  , itemsPerPage = toNaturalNumber(data.itemsPerPage) || defaultItemsPerPage;

	var getTableData = memoize(function (query) {
		return getSortedArray()(function (arr) {
			var pageCount, offset, size = arr.length;
			if (!size) return { size: size };
			pageCount = ceil(size / itemsPerPage);
			if (query.page > pageCount) return { size: size };

			// Pagination
			offset = (query.page - 1) * itemsPerPage;
			arr = slice.call(arr, offset, offset + itemsPerPage);
			return deferred.map(arr, function (data) {
				return mano.dbDriver.getDirectObject(data.id, { keyPaths: listProps })(function (datas) {
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
				if (!query.id) return { passed: false };
				return mano.dbDriver.getDirectObject(query.id, { keyPaths: listProps })(function (datas) {
					return {
						passed: true,
						data: datas.map(function (data) {
							return data.data.stamp + '.' + data.id + '.' + data.data.value;
						})
					};
				});
			});
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
