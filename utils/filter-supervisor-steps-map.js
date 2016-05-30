'use strict';

var oForEach = require('es5-ext/object/for-each')
  , includes = require('es5-ext/array/#/contains')
  , statuses = require('./supervisor-statuses-list');

module.exports = function (stepsMap) {
	var result = {};

	oForEach(stepsMap, function (meta, stepName) {
		result[stepName] = {};

		oForEach(meta, function (conf, name) {
			if (!includes.call(statuses, name)) return;

			result[stepName][name] = conf;
		});
	});

	return result;
};
