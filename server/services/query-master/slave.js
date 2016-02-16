'use strict';

var ensureString    = require('es5-ext/object/validate-stringifiable-value')
  , registerEmitter = require('dbjs-persistence/lib/emitter');

module.exports = function () {
	var send = registerEmitter('queryMaster');
	return function (action/*, query*/) { return send(ensureString(action), arguments[1]); };
};
