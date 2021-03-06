'use strict';

var oForEach = require('es5-ext/object/for-each')
  , includes = require('es5-ext/array/#/contains')
  , d        = require('d')

  , statuses = ['pending', 'sentBack'];

module.exports = function (stepsMap) {
	var result = {};

	oForEach(stepsMap, function (meta, stepName) {
		result[stepName] = Object.defineProperty({}, '_services', d(meta._services));

		oForEach(meta, function (conf, name) {
			if (!includes.call(statuses, name)) return;

			result[stepName][name] = conf;
		});
	});

	return result;
};
