#!/usr/bin/env node
'use strict';

var camelToHyphen = require('es5-ext/string/#/camel-to-hyphen')
  , hyphenToCamel = require('es5-ext/string/#/hyphen-to-camel')
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
  , appName
  , hyphenedAppName
  , appTypes
  , templateType
  , templateVars = {}
  , projectRoot
  , appRootPath
  , appsList;

appTypes = {
	'users-admin': null,
	'meta-dmin': null,
	user: null,
	public: null,
	official: null,
	'business-process-submitted': { 'client/program.js': 'client/program.js/business-process.tpl' },
	'business-process': null
};

projectRoot = process.argv[2];
appName = process.argv[3];

if (!appName) {
	throw new Error('No appName argument provided');
}

if (!projectRoot) {
	throw new Error('No projectRoot argument provided');
}

hyphenedAppName = camelToHyphen.call(appName);

appRootPath = path.resolve(projectRoot, 'apps', hyphenedAppName);

templateVars.appName       = hyphenedAppName;
templateVars.appNameSuffix = hyphenToCamel.call(hyphenedAppName.split('-').slice(1).join('-'));
templateVars.isBusinessProcessSubmitted = hyphenedAppName === 'business-process-submitted';

forEach(appTypes, function (config, typeName) {
	if (templateType) return;
	if (hyphenedAppName === typeName) {
		templateType = typeName;
	}
	if (startsWith.call(hyphenedAppName, typeName)) {
		templateType = typeName;
	}
});

if (!templateType) {
	templateType = 'authenticated';
}

var templates = {};

fs.readdir(path.join(__dirname, 'templates'),
	{ depth: Infinity, type: { file: true } }).map(
	function (templatePath) {
		var fName = path.basename(templatePath, '.tpl')
		  , appPathRel = templatePath.split(path.sep).slice(0, -1).join(path.sep)
		  , appPath = path.join(appRootPath, appPathRel);

		if (appTypes[hyphenedAppName] && appTypes[hyphenedAppName][appPathRel] === templatePath) {
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
		[path.resolve(projectRoot, 'bin', 'adapt-app'), 'apps' + path.sep + 'user'],
			{ env: process.env, cwd: projectRoot });
}).then(function () {
	return generateAppsList(projectRoot)(function () {
		appsList = getApps(projectRoot);
		return appsList;
	});
}).then(function () {
	return generateAppsConf(projectRoot, appsList.value);
}).then(function () {
	return generateAppsCtrls(projectRoot, appsList.value);
}).done(function () {
	console.log("Successfully created " + appName + " application. It's located in: " + appRootPath);
});
