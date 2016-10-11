'use strict';

var descHandler = require('fs2/descriptors-handler')
  , deferred    = require('deferred')
  , gm          = require('gm')

  , promisify   = deferred.promisify;

if (descHandler.initialized) gm.prototype.write = descHandler.wrap(gm.prototype.write);
gm.prototype.writeP = promisify(gm.prototype.write);
gm.prototype.sizeP = promisify(gm.prototype.size);

module.exports = gm;
