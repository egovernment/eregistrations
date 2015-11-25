'use strict';

var debug               = require('debug-ext')('setup')
  , ensureType          = require('dbjs/valid-dbjs-type')
  , ensureStringifiable = require('es5-ext/object/validate-stringifiable-value')
  , resolve             = require('path').resolve
  , writeFile           = require('fs2/write-file')
  , serialize           = require('es5-ext/object/serialize')
  , savePath            = 'apps-common/client/legacy/generated';
/**
 * Generates map for controls-map.js legacy (responsible for parent-child select interaction).
 * @param projectRoot {string}
 * @param config {object}
 * config.child {constructor}         - Class of the child
 * config.parent {constructor}        - Class of the parent
 * config.htmlClass {string}          - The class for html control (should be uniq in DOM)
 * config.linkingProperyName {string} - The name of child's property which points to parent
 *                                      i.e 'category'
 * config.fileNamePrefix {string}     - The prefix of the file in which the map will be stored
 * @returns promise
 */

module.exports = function (projectRoot, config) {
	var result = {
		map: {}
	};

	debug('generate-legacy-' + ensureStringifiable(config.fileNamePrefix) + '-data');
	result.htmlClass       = ensureStringifiable(config.htmlClass);
	result.parentTypeLabel = ensureType(config.parent).label;
	ensureStringifiable(config.linkingPropertyName);

	ensureType(config.child).instances.forEach(function (child) {
		var parentId = child[config.linkingPropertyName].__id__;
		if (!result.map[parentId]) {
			result.map[parentId] = {
				label: child[config.linkingPropertyName].label,
				items: []
			};
		}
		result.map[parentId].items.push(child.__id__);
	});

	return writeFile(resolve(projectRoot, savePath, config.fileNamePrefix + '-map.js'),
				'\'use strict\';\n\nmodule.exports = ' + serialize(result) + ';\n',
			{ intermediate: true });
};
