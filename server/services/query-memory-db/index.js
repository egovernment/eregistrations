'use strict';

var forEach          = require('es5-ext/object/for-each')
  , ensureCallable   = require('es5-ext/object/valid-callable')
  , ensureObject     = require('es5-ext/object/valid-object')
  , ensureString     = require('es5-ext/object/validate-stringifiable-value')
  , registerReceiver = require('dbjs-persistence/lib/receiver')

  , stringify = JSON.stringify;

module.exports = function (actions) {
	forEach(ensureObject(actions), ensureCallable);
	registerReceiver('queryMemoryDb', function (data) {
		var action = ensureString(data.action);
		if (!actions[action]) {
			throw new Error("Not supported queryMaster action: " + stringify(action));
		}
		return actions[action](data.query);
	});
};
