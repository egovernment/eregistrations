'use strict';

var deferred  = require('deferred')
  , resolve   = require('path').resolve
  , writeFile = require('fs2/write-file')
  , env       = require('../../env')
  , staticHost = (env.static && env.static.host) || '/'
  , stringify = JSON.stringify;

module.exports = deferred(
	writeFile(resolve(__dirname, '../../common/client/env.json'), stringify({
		static: { host: staticHost }
	}), { intermediate: true })
);
