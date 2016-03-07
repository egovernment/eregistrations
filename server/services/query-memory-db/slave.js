'use strict';

var ensureObject      = require('es5-ext/object/ensure-object')
  , ensureString      = require('es5-ext/object/validate-stringifiable-value')
  , ensureIterable    = require('es5-ext/iterable/validate-object')
  , d                 = require('d')
  , registerEmitter   = require('dbjs-persistence/lib/emitter')
  , resolveUserAccess = require('mano/lib/server/resolve-user-access')

  , defineProperty = Object.defineProperty;

module.exports = function (process) {
	var send = registerEmitter('queryMemoryDb', ensureObject(process));
	return defineProperty(function (objIds, action/*, query*/) {
		var query = arguments[2];
		action = ensureString(action);
		resolveUserAccess(ensureIterable(objIds))(function () {
			return send({ action: action, query: query });
		});
	}, 'destroy', d(send.destroy));
};
