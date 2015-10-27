#!/usr/bin/env node
'use strict';

var hyphenToCamel = require('es5-ext/string/#/hyphen-to-camel')
  , fs            = require('fs2')
  , path          = require('path')
  , template      = require('es6-template-strings')
  , deferred      = require('deferred')
  , exec          = deferred.promisify(require('child_process').execFile)
  , generateAppsList  = require('mano/scripts/generate-apps-list')
  , generateAppsConf  = require('mano/scripts/generate-apps-conf')
  , generateAppsCtrls = require('mano/scripts/generate-apps-controllers')
  , getApps           = require('mano/server/utils/resolve-apps')
  , staticsPath
  , partialAppName
  , appTypes
  , templateType
  , templateVars = {}
  , appRootPath;

appTypes = {
	'users-admin': true,
	'meta-dmin': true,
	user: true,
	public: true,
	official: true,
	'business-process-submitted': { 'client/program.js': 'client/program.js/business-process.tpl' },
	'business-process': true
};

module.exports = function (projectRoot, appName) {
	appRootPath = path.resolve(projectRoot, 'apps', appName);
	staticsPath = path.join(__dirname, 'public-statics');

	templateVars.appName       = appName;
	templateVars.appNameSuffix = hyphenToCamel.call(appName.split('-').slice(1).join('-'));
	templateVars.isBusinessProcessSubmitted = appName === 'business-process-submitted';

	if (appTypes[appName]) {
		templateType = appName;
	} else {
		var i = 0;
		do {
			--i;
			partialAppName = appName.split('-').slice(0, i).join('-');
			if (appTypes[partialAppName]) {
				templateType = partialAppName;
				break;
			}
		} while (partialAppName);
		if (!templateType) {
			templateType = 'authenticated';
		}
	}

	var templates = {};

	return fs.readdir(path.join(__dirname, 'templates'),
		{ depth: Infinity, type: { file: true } }).map(
		function (templatePath) {
			var fName = path.basename(templatePath, '.tpl')
		  , appPathRel = path.dirname(templatePath)
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
		var toResolve = [deferred.map(Object.keys(templates), function (appPath) {
			return fs.readFile(templates[appPath])(function (fContent) {
				fContent = template(fContent, templateVars, { partial: true });
				return fs.writeFile(appPath, fContent, { intermediate: true });
			})();
		})];
		if (appName === 'public') {
			toResolve.push(fs.readdir(staticsPath,
					{ depth: Infinity, type: { file: true } }).map(function (staticFilePath) {
				return fs.copy(path.join(staticsPath, staticFilePath),
							path.join(appRootPath, staticFilePath.split('public-statics/').slice(-1)[0]),
							{ intermediate: true });
			}));
		}
		return deferred.map(toResolve);
	}).then(function () {
		return deferred(
			exec('node',
				[path.resolve(projectRoot, 'bin', 'adapt-app'), 'apps' + path.sep + appName],
				{ cwd: projectRoot }),
			generateAppsList(projectRoot)(function () {
				return getApps(projectRoot).then(function (appsList) {
					return deferred(generateAppsConf(projectRoot, appsList),
						generateAppsCtrls(projectRoot, appsList));
				}
					);
			})
		);
	});
};
