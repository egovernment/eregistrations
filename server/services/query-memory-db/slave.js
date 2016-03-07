'use strict';

var ensureObject    = require('es5-ext/object/valid-object')
  , ensureString    = require('es5-ext/object/validate-stringifiable-value')
  , ensureIterable  = require('es5-ext/iterable/validate-object')
  , d               = require('d')
  , registerEmitter = require('dbjs-persistence/lib/emitter')

  , defineProperty = Object.defineProperty;

module.exports = function () {
	var send;
	return defineProperty(function (objIds, action/*, query*/) {
		var query = arguments[2], resolveUserAccess = require('mano/lib/server/resolve-user-access');
		if (!send) throw new Error('Process has not been configured for query');
		action = ensureString(action);
		return resolveUserAccess(ensureIterable(objIds))(function () {
			return send({ action: action, query: query });
		});
	}, 'registerAsEmitter', d(function (process) {
		return (send = registerEmitter('queryMemoryDb', ensureObject(process)));
	}));
};
