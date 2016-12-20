'use strict';

var location        = require('mano/lib/client/location')
  , ObservableValue = require('observable-value')
  , copy            = require('es5-ext/object/copy')
  , parseUrl        = require('url3/parse')
  , formatUrl       = require('url3/format')
  , ensureString    = require('es5-ext/object/validate-stringifiable-value')
  , ensureIterable  = require('es5-ext/iterable/validate-object')
  , includes        = require('es5-ext/array/#/contains')
  , aFrom           = require('es5-ext/array/from');
/**
 * @param url {String}
 * @param { only: { Array }, filter: { Array } } - for black list specify filter,
 *                                                 for white list specify only
 */

module.exports = function (url/*, options */) {
	var formAction, formActionUrl, options, params;
	formAction = new ObservableValue();
	options = Object(arguments[1]);
	if (options.only) {
		params = options.only;
	} else if (options.filter) {
		params = options.filter;
	}
	if (params) {
		params = aFrom(ensureIterable(params));
	}
	formActionUrl = parseUrl(ensureString(url), true);
	delete formActionUrl.search;
	var updateUrl = function () {
		// 1. copy all query params from current url
		formActionUrl.query = copy(location.query);
		if (params) {
			if (options.filter) {
				// 2. delete black listed
				params.forEach(function (param) {
					delete formActionUrl.query[param];
				});
			} else {
				// 2. delete not white listed
				Object.keys(formActionUrl.query).forEach(function (param) {
					if (!includes.call(params, param)) {
						delete formActionUrl.query[param];
					}
				});
			}
		}
		formAction.value = formatUrl(formActionUrl);
	};
	location.on('change', updateUrl);
	updateUrl();

	return formAction;
};
