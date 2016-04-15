// Evaluates stored JSON string to object
// Provides on-demand and reactive revaluator

'use strict';

var d               = require('d')
  , lazy            = require('d/lazy')
  , ObservableValue = require('observable-value')
  , memoize         = require('memoizee/plain')

  , parse = JSON.parse;

module.exports = memoize(function (db) {
	return lazy(db.DataSnapshot.prototype, {
		resolved: d(function () {
			this._json.once('change', function () { delete this.resolved; }.bind(this));
			if (!this.json) return {};
			return parse(this.json);
		}),
		_resolved: d(function () {
			var observable = new ObservableValue(this.json ? parse(this.json) : {});
			this._json.on('change', function () {
				observable.value = this.json ? parse(this.json) : {};
			}.bind(this));
			return observable;
		})
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
