'use strict';

var spawn       = require('child_process').spawn
  , descHandler = require('fs2/descriptors-handler')
  , deferred    = require('deferred')
  , debug       = require('debug-ext')('image-processing')
  , gm          = require('gm')
  , env         = require('./env')

  , promisify   = deferred.promisify;

if (descHandler.initialized) gm.prototype.write = descHandler.wrap(gm.prototype.write);
gm.prototype.writeP = promisify(gm.prototype.write);
gm.prototype.sizeP = promisify(gm.prototype.size);

// Detect wether gm is installed
var def = deferred()
  , testProcess = spawn('gm');
testProcess.on('error', function (err) {
	if (!env.dev) {
		def.reject(new Error("GraphicsMagick seems not installed. Please see installation notes " +
			"and ensure mandatory image processing software"));
		return;
	}
	debug("'gm' image processing software not found. " +
		"Application will be deployed without image processing functions");
	def.resolve(false);
});
testProcess.on('close', function () {
	if (def.resolved) return;
	debug("'gm' image processing software found");
	def.resolve(true);
});
gm.getIsInstalled = def.promise;

module.exports = gm;
