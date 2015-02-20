'use strict';

var parse    = require('url3/parse')
  , format   = require('url3/format')
  , location = require('mano/lib/client/location')
  , nextTick = require('next-tick');

module.exports = function (key, value) {
	var url = parse(location.href, true);
	delete url.search;
	if (value != null) url.query[key] = value;
	else delete url.query[key];
	nextTick(function () { location.goto(format(url)); });
};
