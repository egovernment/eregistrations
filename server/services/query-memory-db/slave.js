'use strict';

var ensureString      = require('es5-ext/object/validate-stringifiable-value')
  , ensureIterable    = require('es5-ext/iterable/validate-object')
  , registerEmitter   = require('dbjs-persistence/lib/emitter')
  , resolveUserAccess = require('mano/lib/server/resolve-user-access');

module.exports = function () {
	var send = registerEmitter('queryMemoryDb');
	return function (objIds, action/*, query*/) {
		var query = arguments[2];
		action = ensureString(action);
		resolveUserAccess(ensureIterable(objIds))(function () {
			return send({ action: action, query: query });
		});
	};
};
