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

	var kind = (targetMap.key === 'requirementUploads')
		? 'requirementUploads' : 'paymentReceiptUploads';
	var snapshot = businessProcess[kind].dataSnapshot;

	if (isUserApp(appName)) {
		// If it's a user, then we show to him direct result of saved snapshot
		return snapshot._resolved;
	}
	// Otherwise we show only those items from snapshot which are applicable according
	// to current model state.
	return businessProcess._isClosed.map(function (isClosed) {
		return snapshot._resolved.map(function (data) {
			return getSetProxy(targetMap.applicable).map(function (upload) {
				var uniqueKey = (kind === 'requirementUploads') ? upload.document.uniqueKey : upload.key;
				var snapshot = data && find.call(data, function (snapshot) {
					return uniqueKey === snapshot.uniqueKey;
				});
				if (snapshot) return snapshot;
				if (isClosed) return;
				// If file is not yet closed, then we show all applicable even if they're not referenced in
				// snapshot
				return upload.enrichJSON(upload.toJSON());
			}).filter(Boolean).toArray();
		});
	});
}, {
	normalizer: require('memoizee/normalizers/get-primitive-fixed')(2)
});
