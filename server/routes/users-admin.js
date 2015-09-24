// Users admin GET controllers

'use strict';

var aFrom               = require('es5-ext/array/from')
  , flatten             = require('es5-ext/array/#/flatten')
  , isNaturalNumber     = require('es5-ext/number/is-natural')
  , normalizeOptions    = require('es5-ext/object/normalize-options')
  , toArray             = require('es5-ext/object/to-array')
  , ensureObject        = require('es5-ext/object/valid-object')
  , ensureCallable      = require('es5-ext/object/valid-callable')
  , memoize             = require('memoizee/plain')
  , ensureObservableSet = require('observable-set/valid-observable-set')
  , db                  = require('mano').db
  , getCompare          = require('../../utils/get-compare')
  , serializeView       = require('../../utils/db-view/serialize')
  , getEvents           = require('../../utils/dbjs-get-path-events')
  , QueryHandler        = require('../../utils/query-handler')

  , map = Array.prototype.map, ceil = Math.ceil, stringify = JSON.stringify
  , itemsPerPage = 50;

require('memoizee/ext/max-age');

var userQueryHandler = new QueryHandler([{
	name: 'id',
	ensure: function (value) {
		var user;
		if (!value) throw new Error("Missing id");
		user = db.User.getById(value);
		if (!user) return null;
		return value;
	}
}]);

module.exports = exports = function (data) {
	data = normalizeOptions(ensureObject(data));
	ensureObservableSet(data.users);
	var listProps = aFrom(data.listProperties)
	  , tableQueryHandler = new QueryHandler(exports.tableQueryConf)
	  , getOrderIndex = ensureCallable(data.getOrderIndex)
	  , compare = getCompare(getOrderIndex);

	var getTableData = memoize(function (query) {
		var list, pageCount, offset, size;
		list = exports.listModifiers.reduce(function (list, modifier) {
			if (modifier.name && (query[modifier.name] == null) && !modifier.required) return list;
			return modifier.process(list, query[modifier.name], data);
		}, null);
		size = list.size;
		if (!size) return { size: size };
		pageCount = ceil(size / itemsPerPage);
		if (query.page > pageCount) return { size: size };
		// Sort
		list = list.toArray(compare);
		// Pagination
		offset = (query.page - 1) * itemsPerPage;
		list = list.slice(offset, offset + itemsPerPage);
		return {
			view: serializeView(list, getOrderIndex),
			size: size,
			data: flatten.call(map.call(list, function (object) {
				var events = listProps.map(function (path) { return getEvents(object, path); });
				events.unshift(object._lastOwnEvent_);
				return events;
			})).map(String)
		};
	}, {
		normalizer: function (args) { return String(toArray(args[0], null, null, true)); },
		maxAge: 10 * 1000
	});

	return {
		'get-users-view': function (query) { return getTableData(tableQueryHandler.resolve(query)); },
		'get-user-data': function (query) {
			var events, user;
			query = userQueryHandler.resolve(query);
			if (!query.id) return { passed: false };
			user = db.User.getById(query.id);
			events = flatten.call(listProps.map(function (path) { return getEvents(user, path); }));
			events.unshift(user._lastOwnEvent_);
			return { data: events.map(String), passed: true };
		}
	};
};

exports.listModifiers = [{
	process: function (ignore, value, data) { return data.users; }
}];

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
