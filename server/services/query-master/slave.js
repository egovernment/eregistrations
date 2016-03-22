'use strict';

var ensureString    = require('es5-ext/object/validate-stringifiable-value')
  , registerEmitter = require('dbjs-persistence/lib/emitter')
	, send = registerEmitter('queryMaster');

module.exports = function (action/*, query*/) {
	return send({ action: ensureString(action), query: arguments[1] });
};
