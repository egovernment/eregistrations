'use strict';

var forEach          = require('es5-ext/object/for-each')
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
	'node_modules/eregistrations/public',
	'apps/public/public'
];

module.exports = function (root, conf) {
	var old, nu = create(null), result = [], cachePath = resolve(ensureString(root), '.cloudfront');
	ensureObject(conf);
	debug("cloudfront refresh");
	return deferred(
		readFile(cachePath)(parse).catch({}).aside(function (data) { old = data; }),
		readdir(resolve(root, 'apps'), { type: { directory: true } })(function (names) {
			var paths = publicPaths.concat(names.map(function (path) {
				return resolve(root, 'apps', path, 'public');
			}));
			return deferred.reduce(paths, function (ignore, dirPath) {
				return readdir(resolve(root, dirPath), publicScanOpts).map(function (path) {
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
			}, null);
		})
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
