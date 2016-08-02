'use strict';

var includes        = require('es5-ext/array/#/contains')
  , location        = require('mano/lib/client/location')
  , ObservableValue = require('observable-value');

module.exports = function (baseUrl, params) {
	var dynamicUrl = new ObservableValue();

	var updateUrl = function () {
		var url = baseUrl, filteredParams;

		filteredParams = Object.keys(location.query).filter(function (param) {
			return includes.call(params, param);
		});
		if (filteredParams.length) {
			url += '?';
			url += filteredParams.map(function (key) {
				return key + '=' + location.query[key];
			}).join('&');
		}
		dynamicUrl.value = url;
	};
	location.on('change', updateUrl);
	updateUrl();

	return dynamicUrl;
};
