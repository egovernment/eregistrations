'use strict';

var aFrom            = require('es5-ext/array/from')
  , ensureIterable   = require('es5-ext/iterable/validate-object')
  , forEach          = require('es5-ext/object/for-each')
  , ensureObject     = require('es5-ext/object/valid-object')
  , ensureString     = require('es5-ext/object/validate-stringifiable-value')
  , deferred         = require('deferred')
  , debug            = require('debug-ext')('setup')
  , debugCloudfront  = require('debug-ext')('cloudfront')
  , path             = require('path')
  , createHash       = require('crypto').createHash
  , inspect          = require('util').inspect
  , createReadStream = require('fs').createReadStream
  , invalidate       = deferred.promisify(require('invalidatejs'))
  , readFile         = require('fs2/read-file')
  , writeFile        = require('fs2/write-file')
  , readdir          = require('fs2/readdir')

  , create = Object.create, parse = JSON.parse, stringify = JSON.stringify
  , resolve = path.resolve
  , publicScanOpts = { type: { file: true }, depth: Infinity };

var publicPaths = [
	'public',
	'node_modules/eregistrations/public'
];

module.exports = function (root, appsList, conf) {
	var old, nu = create(null), result = [], cachePath = resolve(ensureString(root), '.cloudfront');
	var paths = publicPaths.concat(aFrom(ensureIterable(appsList), function (appName) {
		return resolve(root, appName, 'public');
	}));
	ensureObject(conf);
	debug("cloudfront-invalidate");
	return deferred(
		readFile(cachePath)(parse).catch({}).aside(function (data) { old = data; }),
		deferred.reduce(paths, function (ignore, dirPath) {
			return readdir(resolve(root, dirPath), publicScanOpts)(function (paths) {
				return deferred.map(paths, function (path) {
					var hash, def, fd;
					if (path === '.gitignore') return;
					if (nu[path]) return;
					nu[path] = true;
					hash = createHash('sha1');
					def = deferred();
					fd = createReadStream(resolve(root, dirPath, path));
					hash.setEncoding('hex');
					fd.on('error', def.reject);
					fd.on('end', function () {
						hash.end();
						nu[path] = hash.read();
						def.resolve();
					});
					fd.pipe(hash);
					return def.promise;
				});
			}, function (err) {
				if (err.code === 'ENOENT') return;
				throw err;
			});
		}, null)
	)(function () {
		forEach(nu, function (hash, path) {
			if (old[path] !== hash) result.push('/' + path);
		});
		if (!result.length) {
			debugCloudfront("no files to refresh");
			return;
		}
		debugCloudfront("%s files to refresh:", result.length);
		result.forEach(function (path) { debugCloudfront("- %s", path); });
		return invalidate({
			resourcePaths: result,
			secret_key: conf.secret,
			access_key: conf.key,
			dist: conf.distribution
		}).spread(function (statusCode, body) {
			if (statusCode === 201) {
				debugCloudfront("refresh ok");
			} else {
				debugCloudfront("refresh not ok, status: %s", statusCode);
				console.error(inspect(body, { depth: 20, colors: true }));
				throw new Error("Cloudfront refresh error");
			}
			return writeFile(cachePath, stringify(nu));
		});
	});
};
