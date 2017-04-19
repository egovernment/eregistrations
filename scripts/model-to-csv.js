'use strict';

var fs    = require('fs2')
  , path  = require('path')
  , debug = require('debug-ext')('setup');

module.exports = function (projectRoot) {
	debug('model-to-csv');
	require(path.resolve(projectRoot, 'server/env'));
	return fs.readdir(path.resolve(projectRoot, 'model'),
		{ type: { directory: true } }).map(function (path) {
		return path.match(/^business-process-/) ? path : null;
	}).then(function (servicePaths) {
		servicePaths = servicePaths.filter(Boolean);
		servicePaths.forEach(function (servicePath) {
			var BusinessProcess = require(path.resolve(projectRoot, 'model', servicePath)), res
			  , csvResult;
			res = BusinessProcess.prototype.toMetaDataJSON();
			csvResult = [];
			csvResult.push([
				'Name',
				'Path',
				'Type',
				'Label',
				'Required',
				'Pattern'].join(','));

			res.forEach(function (field) {
				csvResult.push(Object.keys(field).map(function (name) {
					if (field[name] && typeof field[name].replace === 'function') {
						return field[name].replace(/,/g, ' ');
					}
					return field[name];
				}).join(','));
			});
			csvResult = csvResult.join('\n');
			fs.writeFile(projectRoot + '/public/csv/' +
					BusinessProcess.__id__.replace('BusinessProcess', '') + '.csv',
				csvResult, { intermediate: true });
			debug('Created model fields csv for: %s', BusinessProcess.__id__);
		});
	});
};
