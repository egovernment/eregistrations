'use strict';

var debug              = require('debug-ext')('setup')
  , deferred           = require('deferred')
  , resolveProjectRoot = require('cjs-module/resolve-project-root')
  , projectRoot        = process.cwd()
  , resolve            = require('path').resolve
  , writeFile          = require('fs2/write-file')
  , serialize          = require('es5-ext/object/serialize')
  , savePath           = 'apps-common/client/legacy/generated';

module.exports = function (Child, Parent, linkingPropertyName, fileNamePrefix) {
	var result = {
		map: {},
		parentTypeLabel: Parent.label
	};

	debug('generate-legacy-' + fileNamePrefix + '-data');

	return resolveProjectRoot(projectRoot).done(function (root) {
		if (!root) {
			throw new Error('Could not located project in projectRoot: ' + projectRoot);
		}

		Child.instances.forEach(function (child) {
			var parentId = child[linkingPropertyName].__id__;
			if (!result.map[parentId]) {
				result.map[parentId] = {
					label: child[linkingPropertyName].label,
					items: []
				};
			}
			result.map[parentId].items.push(child.__id__);
		});

		return deferred(
			writeFile(resolve(savePath, fileNamePrefix + '-map.generated.js'),
					'\'use strict\';\n\nmodule.exports = ' + serialize(result) + ';\n',
				{ intermediate: true })
		);
	});
};
