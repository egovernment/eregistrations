'use strict';

var aFrom         = require('es5-ext/array/from')
  , ObservableSet = require('observable-set');

module.exports = function (t, a) {
	var someSet = new ObservableSet(['foo', true, 23])
	  , proxySet = t(someSet);
	a.deep(aFrom(proxySet), ['foo', true, 23]);
	someSet.delete(true);
	someSet.add('elo');
	a.deep(aFrom(proxySet), ['foo', 23, 'elo']);
};
