'use strict';

var resolve  = require('path').resolve
  , stat     = require('fs2/stat')
  , readFile = require('fs2/read-file')

  , create = Object.create;

module.exports = function () {
	var cache = create(null);

	return function (path) {
		path = resolve(path);
		return stat(path)(function (stats) {
			var etag = stats.size + '.' + stats.mtime.valueOf();
			if (cache[path]) {
				if (cache[path].etag === etag) return cache[path].data;
				cache[path].etag = etag;
			} else {
				cache[path] = { etag: etag };
			}
			return (cache[path].data = readFile(path, 'utf8'));
		});
	};
};
