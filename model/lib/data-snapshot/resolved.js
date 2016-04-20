// Evaluates stored JSON string to object
// Provides on-demand and reactive revaluator
// Should be loaded in processes that need to use snapshots in natural (not serialized) form

'use strict';

var d               = require('d')
  , lazy            = require('d/lazy')
  , ObservableValue = require('observable-value')
  , memoize         = require('memoizee/plain')

  , defineProperties = Object.defineProperties;

module.exports = memoize(function (db) {
	defineProperties(db.DataSnapshot.prototype, lazy({
		resolved: d(function () {
			this._jsonString.once('change', function () { delete this.resolved; }.bind(this));
			return this.resolve();
		}),
		_resolved: d(function () {
			var observable = new ObservableValue(this.resolve());
			this._jsonString.on('change', function () { observable.value = this.resolve(); }.bind(this));
			return observable;
		})
	}));
	return db.DataSnapshot;
}, { normalizer: require('memoizee/normalizers/get-1')() });
