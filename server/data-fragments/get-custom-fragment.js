// Returns fragment generator, where each returned fragment emits selected indexed data for
// specified object

'use strict';

var ensureString    = require('es5-ext/object/validate-stringifiable-value')
  , ensureDriver    = require('dbjs-persistence/ensure')
  , Fragment        = require('data-fragment')
  , assimilateEvent = require('./lib/assimilate-driver-event');

module.exports = function (driver, ns) {
	var fragment;

	ensureDriver(driver);
	ns = ensureString(ns);
	fragment = new Fragment();
	fragment.promise = driver.getReducedNs(ns)(function (data) {
		data.forEach(function (data) { assimilateEvent(fragment, data.id, data.data); });
	});
	driver.on('object:' + ns, function (event) { assimilateEvent(fragment, event.id, event.data); });
	return fragment;
};
