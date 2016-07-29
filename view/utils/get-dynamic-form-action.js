'use strict';

var location             = require('mano/lib/client/location')
  , ObservableValue      = require('observable-value')
  , copy                 = require('es5-ext/object/copy')
  , parseUrl             = require('url3/parse')
  , formatUrl            = require('url3/format');
/**
 * @param url {String}
 * @param params {Array} - array of url parameters which are setup through the form
 */

module.exports = function (url, params) {
	var formAction, formActionUrl;
	formAction = new ObservableValue();
	formActionUrl = parseUrl(url, true);
	delete formActionUrl.search;
	var updateUrl = function () {
		// 1. copy all query params from current url
		formActionUrl.query = copy(location.query);
		// 2. delete all params that are provided by this form
		params.forEach(function (param) {
			delete formActionUrl.query[param];
		});
		formAction.value = formatUrl(formActionUrl);
	};
	location.on('change', updateUrl);
	updateUrl();

	return formAction;
};
