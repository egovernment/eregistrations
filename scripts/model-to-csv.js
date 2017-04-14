'use strict';

var fs     = require('fs2')
  , path   = require('path');

module.exports = function (projectRoot) {
	require(path.resolve(projectRoot, 'server/env'));
	fs.readdir(path.resolve(projectRoot, 'model'),
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
					return field[name];
				}).join(','));
			});
			csvResult.join('\n');
			fs.writeFile(projectRoot + '/model-to-csv/' + BusinessProcess.prototype.__id__ + '.csv',
				csvResult, { intermediate: true });
		});
	}).done();
};
