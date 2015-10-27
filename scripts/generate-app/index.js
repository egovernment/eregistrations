#!/usr/bin/env node
'use strict';

var hyphenToCamel = require('es5-ext/string/#/hyphen-to-camel')
  , fs            = require('fs2')
  , path          = require('path')
  , startsWith    = require('es5-ext/string/#/starts-with')
  , forEach       = require('es5-ext/object/for-each')
  , template      = require('es6-template-strings')
  , deferred      = require('deferred')
  , exec          = deferred.promisify(require('child_process').execFile)
  , generateAppsList  = require('mano/scripts/generate-apps-list')
  , generateAppsConf  = require('mano/scripts/generate-apps-conf')
  , generateAppsCtrls = require('mano/scripts/generate-apps-controllers')
  , getApps           = require('mano/server/utils/resolve-apps')
  , appTypes
  , templateType
  , templateVars = {}
  , appRootPath;

appTypes = {
	'users-admin': null,
	'meta-dmin': null,
	user: null,
	public: null,
	official: null,
	'business-process-submitted': { 'client/program.js': 'client/program.js/business-process.tpl' },
	'business-process': null
};

module.exports = function (projectRoot, appName) {
	appRootPath = path.resolve(projectRoot, 'apps', appName);

	templateVars.appName       = appName;
	templateVars.appNameSuffix = hyphenToCamel.call(appName.split('-').slice(1).join('-'));
	templateVars.isBusinessProcessSubmitted = appName === 'business-process-submitted';

	forEach(appTypes, function (config, typeName) {
		if (templateType) return;
		if (appName === typeName) {
			templateType = typeName;
		}
		if (startsWith.call(appName, typeName)) {
			templateType = typeName;
		}
	});

	if (!templateType) {
		templateType = 'authenticated';
	}

	var templates = {};

	return fs.readdir(path.join(__dirname, 'templates'),
		{ depth: Infinity, type: { file: true } }).map(
		function (templatePath) {
			var fName = path.basename(templatePath, '.tpl')
		  , appPathRel = templatePath.split(path.sep).slice(0, -1).join(path.sep)
		  , appPath = path.join(appRootPath, appPathRel);

			if (appTypes[appName] && appTypes[appName][appPathRel] === templatePath) {
				templates[appPath] = path.join(__dirname, 'templates', templatePath);
				return;
			}
			if (fName === templateType) {
				templates[appPath] = path.join(__dirname, 'templates', templatePath);
				return;
			}
			if (fName === 'authenticated' && !templates[appPath]) {
				templates[appPath] = path.join(__dirname, 'templates', templatePath);
			}
		}
	).then(function () {
		return deferred.map(Object.keys(templates), function (appPath) {
			return fs.readFile(templates[appPath])(function (fContent) {
				fContent = template(fContent, templateVars, { partial: true });
				return fs.writeFile(appPath, fContent, { intermediate: true });
			})();
		});
	}).then(function () {
		return exec('node',
			[path.resolve(projectRoot, 'bin', 'adapt-app'), 'apps' + path.sep + appName],
			{ cwd: projectRoot });
	}).then(function () {
		return generateAppsList(projectRoot)(function () {
			return getApps(projectRoot);
		});
	}).then(function (appsList) {
		return deferred.map([generateAppsConf, generateAppsCtrls], function (generator) {
			return generator(projectRoot, appsList);
		});
	});
};
