// Base objects list manager
// Dedicated to handle tables of data (e.g. table of users in Users Admin or
// table of business processes in Official roles)
// It is updated with query object, which provides expected state charactericts
// then resolves via server desired list and emits update event

'use strict';

var assign              = require('es5-ext/object/assign')
  , normalizeOptions    = require('es5-ext/object/normalize-options')
  , toArray             = require('es5-ext/object/to-array')
  , ensureValue         = require('es5-ext/object/valid-value')
  , d                   = require('d')
  , lazy                = require('d/lazy')
  , ee                  = require('event-emitter')
  , unserializeId       = require('../../../utils/db-view/unserialize-id')
  , defaultItemsPerPage = require('../../../conf/objects-list-items-per-page')

  , ceil = Math.ceil, create = Object.create, stringify = JSON.stringify;

var ListManager = module.exports = function (type) {};

ee(Object.defineProperties(ListManager.prototype, assign({
	page: d(1),
	pageCount: d(1),
	itemsPerPage: d(50),
	size: d(defaultItemsPerPage),
	list: d(null),

	_modifiers: d([]),

	_currentQueryId: d(null),
	_resolveList: d(function (data, query) {
		return data.view.map(function (id) {  unserializeId(id, this._type); }, this);
	}),
	_resolveExternalResult: d(function (data, query, queryId) {
		var list = this._resolveList(data, query);
		if (!list.length && (query.page > 1)) {
			return normalizeOptions(query, { page: ceil(this.size / this.itemsPerPage) });
		}
		this._processResult({ list: list, size: data.size, serverResult: data }, query);
	}),
	update: d(function (query) {
		var queryId;
		query = normalizeOptions(query);
		query.page = Number(query.page);
		this.query = query;
		queryId = stringify(toArray(query, null, null, true));
		if (this._currentQueryId === queryId) return;
		this._currentQueryId = queryId;
		this._queryExternal(query).done(function (data) {
			var fixedQuery;
			ensureValue(data.size);
			this._cache[queryId] = data;
			if (this._currentQueryId !== queryId) return;
			fixedQuery = this._resolveExternalResult(data, query, queryId);
			if (fixedQuery) this.update(query);
		}.bind(this));
		return;
	}),
	_processResult: d(function (result, query) {
		this.list = result.list;
		this.size = result.size;
		this.serverResult = result.serverResult;
		this.pageCount = ceil(this.size / this.itemsPerPage);
		this.page = (query.page > this.pageCount) ? this.pageCount : query.page;
		this.emit('change');
	})
}, lazy({
	_cache: d(function () { return create(null); })
}))));
