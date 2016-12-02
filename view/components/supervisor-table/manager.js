// Supervisor dedicated list manager
// (used to handle processing steps table in supervisor role)

'use strict';

var includes        = require('es5-ext/array/#/contains')
  , toNaturalNumber = require('es5-ext/number/to-pos-integer')
  , toArray         = require('es5-ext/object/to-array')
  , ensureObject    = require('es5-ext/object/valid-object')
  , d               = require('d')
  , memoize         = require('memoizee/plain')
  , db              = require('mano').db
  , getData         = require('mano/lib/client/xhr-driver').get
  , ListManager     = require('../objects-table/manager')
  , unserializeView = require('../../../utils/db-view/unserialize')
  , timeRanges      = require('../../../utils/supervisor-time-ranges')
  , getSearchFilter = require('../../../utils/get-search-filter')
  , resolveStepPath = require('../../../utils/resolve-processing-step-full-path')

  , defineProperties = Object.defineProperties;

require('memoizee/ext/max-age');

var getViewData = function (query) {
	return getData('/get-processing-steps-view/', query).aside(function (result) {
		if (!result.data) return;
		result.data.forEach(function (eventStr) { db.unserializeEvent(eventStr, 'server-temporary'); });
	});
};

var SupervisorManager = module.exports = function (conf) {
	var stepsMap = ensureObject(conf.stepsMap)
	  , searchFilter = getSearchFilter
	  , itemsPerPage = toNaturalNumber(conf.itemsPerPage);

	if (itemsPerPage) this.itemsPerPage = itemsPerPage;

	defineProperties(this, {
		_stepsMap: d(stepsMap),
		_getSearchFilter: d(searchFilter),
		_queryExternal: d(memoize(getViewData, {
			normalizer: function (args) { return String(toArray(args[0], null, null, true)); },
			maxAge: 10 * 1000
		}))
	});
};

SupervisorManager.prototype = Object.create(ListManager.prototype, {
	constructor: d(SupervisorManager),
	_type: d(db.BusinessProcess),

	// Characterics that needs to be provided per system/user:
	_stepsMap: d(null),
	_getSearchFilter: d(null),

	_isExternalQuery: d(function (query) {
		var status = query.status || 'pending'
		  , views;
		// When we have all the items, we don't need to query server
		if (!query.step) {
			views = db.views.supervisor.all;
		} else {
			views = db.views.businessProcesses.getBySKeyPath(query.step)[status];
		}
		if (views.totalSize <= this.itemsPerPage) return false;
		// If it's not about first page, it's only server that knows
		if (query.page > 1) return true;
		// If it's purely a first page of a status, we know
		return this._modifiers.some(function (mod) {
			return (mod.name !== 'step') && query[mod.name];
		});
	}),
	// Modifiers (used only in case of non-external list resolution)
	_modifiers: d([
		{
			name: 'step',
			required: true,
			process: function (ignore, query) {
				var list = []
				  , status = query.status || 'pending'
				  , views, stepViews;

				if (!query.step) {
					views = db.views.supervisor.all;
					list = unserializeView(views.get(1), this._type);
				} else {
					views = db.views.businessProcesses.getBySKeyPath(query.step)[status];
					stepViews = unserializeView(views.get(1), this._type);
					list = stepViews.map(function (businessProcess) {
						return businessProcess.processingSteps.map.getBySKeyPath(resolveStepPath(query.step));
					});
				}

				return {
					list: list,
					size: views.totalSize
				};
			}
		},
		{
			name: 'time',
			process: function (data, query) {
				var list = data.list, result, threshold;
				timeRanges.some(function (item) {
					if (item.name === query.time) {
						threshold = item.value;
						return true;
					}
				});
				result = list.filter(function (processingStep) {
					var value = Date.now() - (processingStep._status.lastModified / 1000);
					return value >= threshold;
				});
				return { list: result, size: result.length };
			}
		},
		{
			name: 'search',
			process: function (data, query) {
				var value = query.search.split(/\s+/), list = data.list, result;
				result = list.filter(this._getSearchFilter(value.shift()));
				if (value.length) {
					result = value.reduce(function (result, value) {
						return result.filter(function (item) {
							return includes.call(this, item);
						}, list.filter(this._getSearchFilter(value)));
					}.bind(this), result);
				}
				return { list: result, size: result.length };
			}
		}
	])
});
