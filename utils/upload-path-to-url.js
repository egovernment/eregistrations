'use strict';

module.exports = function (path) {
	return (path != null) ? '/' + String(path).split('/').map(encodeURIComponent).join('/') : null;
};
