// Resolves file path to it's url
// At this point we serve all static files from root directory scope

'use strict';

module.exports = function (path) {
	return (path != null) ? '/' + String(path).split('/').map(encodeURIComponent).join('/') : null;
};
