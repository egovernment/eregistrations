'use strict';

var find             = require('es5-ext/array/#/find')
  , ensureString     = require('es5-ext/object/validate-stringifiable-value')
  , memoize          = require('memoizee/plain')
  , ensureDbjsObject = require('dbjs/valid-dbjs-object')
  , isUserApp        = require('../../utils/is-user-app')
  , getSetProxy      = require('../../utils/observable-set-proxy');

module.exports = memoize(function (targetMap, appName) {
	var businessProcess = ensureDbjsObject(targetMap).master;
	appName = ensureString(appName);

	return businessProcess._isClosed.map(function (isClosed) {
		if (!isClosed) {
			// User, can see released certificates only when request is finalized
			if (isUserApp(appName)) return null;
			return targetMap.released.toArray();
		}
		if (isUserApp(appName)) {
			// For user we show certificates as they're stored in snapshot
			return businessProcess.certificates.dataSnapshot._resolved;
		}
		// For officials we show only those certificates from snapshot which are applicable
		// to be exposed to him
		return businessProcess.certificates.dataSnapshot._resolved.map(function (data) {
			if (!data) return;
			return getSetProxy(targetMap.released).map(function (certificate) {
				var snapshot = find.call(data, function (snapshot) {
					return certificate.key === snapshot.uniqueKey;
				});
				if (snapshot) return snapshot;
			}).filter(Boolean).toArray();
		});
	});
}, {
	normalizer: require('memoizee/normalizers/get-primitive-fixed')(2)
});
