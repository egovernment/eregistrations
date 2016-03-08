// Iterates over all js files in project
// (obeying .gitignore rules and excluding node_modules folder)
// and applies rewrite logic

'use strict';

var ensureCallable = require('es5-ext/object/valid-callable')
  , ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , escape         = require('es5-ext/reg-exp/escape')
  , debug          = require('debug-ext')('fix-db-require')
  , path           = require('path')
  , readdir        = require('fs2/readdir')
  , readFile       = require('fs2/read-file')
  , writeFile      = require('fs2/write-file')
  , isModule       = require('./is-js-module')
  , resolveRoot    = require('cjs-module/resolve-package-root')

  , push = Array.prototype.push
  , basename = path.basename, resolve = path.resolve;

var readdirOpts = { depth: Infinity, type: { file: true }, ignoreRules: 'git', stream: true,
	dirFilter: function (path) { return (basename(path) !== 'node_modules'); },
	pattern: new RegExp(escape(path.sep) + '(?:[^.]+|.+\\.js)$') };

module.exports = function (path, replace) {
	path = resolve(ensureString(path));
	ensureCallable(replace);
	return resolveRoot(path)(function (root) {
		var filePromises = [], dirReader;
		if (!root) throw new Error("Unable to resolve package root");
		dirReader = readdir(root, readdirOpts);
		dirReader.on('change', function (event) {
			push.apply(filePromises, event.added.map(function (file) {
				var filePath = resolve(root, file);
				return isModule(filePath)(function (is) {
					if (!is) return;
					return readFile(filePath, 'utf8')(function (content) {
						var updated = replace(content, file);
						if (updated == null) return;
						updated = ensureString(updated);
						if (content !== updated) {
							debug('rewrite %s', file);
							return writeFile(filePath, updated);
						}
					});
				});
			}));
		});
	});
};
