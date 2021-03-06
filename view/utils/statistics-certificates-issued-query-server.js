'use strict';

var memoize = require('memoizee')
  , getData = require('mano/lib/client/xhr-driver').get;

module.exports = memoize(function (query) {
	return getData('/get-certificates-issued-data/', query);
}, {
	normalizer: function (args) { return JSON.stringify(args[0]); },
	max: 1000
});
